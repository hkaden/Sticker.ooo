

const mongooseCrudify = require('mongoose-crudify');
const uuidv4 = require('uuid/v4');
const fs = require('fs');
const { body } = require('express-validator/check');
const helpers = require('../utils/helpers');
const Sticker = require('../models/Sticker');
const crypto = require('../utils/crypto');
const auth = require('../middleware/auth');
const { ValidationError } = require('../errors');
const { expressValidatorErrorHandler } = require('../utils/expressErrorHandlers');
const { TYPES, MESSAGES } = require('../configs/constants');

const createStickerValidators = [
  body('stickers').isArray().withMessage('must be an array'),
  body('stickers.*').isArray().withMessage('must be an array'),
  body('stickers.*.*').isString().matches(/^data:image\/webp;base64,/).withMessage('must be valid webp data url'),
  body('trays').isArray().withMessage('must be an array'),
  body('trays.*').isString().matches(/^data:image\/png;base64,/).withMessage('must be valid png data url'),
  body().custom(body => body.trays.length === body.stickers.length).withMessage('Lengths of trays and stickers must match'),
  expressValidatorErrorHandler,
];

module.exports = function (server) {
  // Docs: https://github.com/ryo718/mongoose-crudify
  const selectFields = '-__v';
  server.use(
    '/api/stickers',
    auth.optional,
    mongooseCrudify({
      Model: Sticker,
      identifyingKey: 'uuid',
      selectFields, // Hide '__v' property
      endResponseInAction: false,

      beforeActions: [{
        middlewares: [...createStickerValidators, generateStickersAndTrayImages],
        only: ['create'],
      }],
      actions: {
        // disable update and delete
        update: (req, res) => { res.sendStatus(405); },
        delete: (req, res) => { res.sendStatus(405); },
        list: async (req, res, next) => {
          const listDefaults = {
            limit: 10,
            offset: 0,
          };
          const maxLimit = 20;
          const options = {
            ...listDefaults,
            ...req.query,
          };
          options.limit = Math.min(maxLimit, parseInt(options.limit));
          options.offset = parseInt(options.offset);

          const findConditions = {
            $or: [
              { sharingType: 'public' },
              { sharingType: { $exists: false } },
            ],
          };

          try {
            let docs = await Sticker.find(findConditions)
              .limit(options.limit)
              .skip(options.offset)
              .sort({ createdAt: -1 })
              .select(selectFields);
            docs = docs.map(item => ({
              ...item.toJSON(),
              trays: item.trays.slice(0, 1),
              stickers: item.stickers.slice(0, 1).map(pack => pack.slice(0, 5)),
            }));

            const totalCount = await Sticker.count(findConditions);

            res.set('X-Total-Count', totalCount);
            req.crudify = { result: { count: totalCount, data: docs } };
            next();
          } catch (e) {
            next(e);
          }
        },
      }, // list (GET), create (POST), read (GET), update (PUT), delete (DELETE)
      afterActions: [
        { middlewares: [encryptResponse], only: ['create', 'list'] },
        { middlewares: [helpers.formatResponse] },
      ],
    }),
  );

  function encryptResponse(req, res, next) {
    if (process.env.ENCRYPT_RESPONSE === 'true') {
      req.crudify.result = {
        data: crypto.encrypt(JSON.stringify(req.crudify.result), process.env.CRYPTO_PASSPHRASE),
      };
    }
    next();
  }

  /**
     * Generate sticker and tray images
     * and set uuid before inserting into db
     */
  function generateStickersAndTrayImages(req, res, next) {
    const id = uuidv4();

    try {
      req.body.stickers = req.body.stickers.map(pack => pack.map(image => downloadBase64Image(image, 'stickers', id)));
      req.body.trays = req.body.trays.map(image => downloadBase64Image(image, 'tray', id));
      req.body.uuid = id;
      next();
    } catch (e) {
      next(e);
    }
  }

  /**
     * Download Images to target path from a base64 string
     * and return its relative path
     */
  function downloadBase64Image(image, type, id) {
    const dataUrlRegex = /^data:image\/(\w+);base64,/;

    const execArray = dataUrlRegex.exec(image);
    if (execArray == null) {
      throw new ValidationError(MESSAGES.INVALID_DATAURL);
    }
    const extension = execArray[1];

    const path = `/static/imageStore/${type}/${id}`;
    const data = image.replace(dataUrlRegex, '');
    const buffer = Buffer.from(data, 'base64');
    const local = `${__dirname}/../..${path}`;
    const file = `/${uuidv4()}.${extension}`;
    const localPath = local + file;
    const dbPath = path + file;

    if (buffer.length > 100 * 1024) {
      throw new ValidationError(MESSAGES.VERIFY_IMAGE);
    }

    if (!fs.existsSync(local)) {
      fs.mkdirSync(local);
    }

    fs.writeFile(localPath, buffer, () => {});
    return dbPath;
  }
};
