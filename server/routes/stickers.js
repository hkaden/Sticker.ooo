const mongooseCrudify = require('mongoose-crudify');
const uuidv4 = require('uuid/v4');
const fs = require('fs');
const util = require('util');
const _ = require('lodash');
const { body, query, param } = require('express-validator/check');
const helpers = require('../utils/helpers');
const { incrementSiteStats, incrementStickerStats } = require('../utils/statisticsHelper');
const Sticker = require('../models/Sticker');
const User = require('../models/User');
const crypto = require('../utils/crypto');
const auth = require('../middleware/auth');
const { ValidationError } = require('../errors');
const { expressValidatorErrorHandler, expressValidatorSanitizer } = require('../utils/expressErrorHandlers');
const { TYPES, MESSAGES } = require('../configs/constants');
const { siteStatsFields } = require('../utils/statisticsHelper');
const { paginationValidators } = require('../utils/validators')

const getStickerJsonValidators = [
  param('uuid').isUUID().withMessage(MESSAGES.IS_UUID),
  param('packId').isInt().withMessage(MESSAGES.IS_NUMBER).toInt(),
];

const createStickerValidators = [
  auth.required,
  body('name').isString().isLength({ min: 1, max: 128 }),
  body('sharingType').isString().withMessage(MESSAGES.IS_STRING),
  body('stickers').isArray().withMessage(MESSAGES.IS_ARRAY),
  body('stickers.*').isArray().withMessage(MESSAGES.IS_ARRAY),
  body('stickers.*.*').isString().matches(/^data:image\/webp;base64,/).withMessage(MESSAGES.IS_VALID_DATAURL),
  body('tray').isString().matches(/^data:image\/png;base64,/).withMessage(MESSAGES.IS_VALID_DATAURL),
  body('trays').isArray().withMessage(MESSAGES.IS_ARRAY),
  body('trays.*').isString().matches(/^data:image\/png;base64,/).withMessage(MESSAGES.IS_VALID_DATAURL),
  body('userTags').optional().isArray().withMessage(MESSAGES.IS_ARRAY),
  body('userTags.*').isString().withMessage(MESSAGES.IS_STRING),
  body().custom(reqBody => reqBody.trays.length === reqBody.stickers.length).withMessage('Lengths of trays and stickers must match'),
  expressValidatorSanitizer,
  expressValidatorErrorHandler,
];

const updateStickerValidators = [
  auth.required,
  body('name').optional().isString().isLength({ min: 1, max: 128 }),
  body('sharingType').optional().isString().withMessage(MESSAGES.IS_STRING),
  body('userTags').optional().isArray().withMessage(MESSAGES.IS_ARRAY),
  body('userTags.*').isString().withMessage(MESSAGES.IS_STRING),
  expressValidatorSanitizer,
  expressValidatorErrorHandler,
];

const listStickerValidators = [
  ...paginationValidators([...siteStatsFields, 'popular', 'latest', 'updatedAt', 'createdAt']),
  expressValidatorErrorHandler,
];

const selectFields = '-__v';

module.exports = (server) => {
  // Docs: https://github.com/ryo718/mongoose-crudify
  server.get('/api/stickers/:uuid/packs/:packId.json', getStickerJsonValidators, async (req, res, next) => {
    try {
      // packId starts from 1
      const { uuid, packId } = req.params;
      const sticker = (await Sticker.findOne({uuid})).toJSON();

      if (sticker) {
        const packs = sticker.stats.packs;
        if (packId >= 1 && packId <= packs) {
          const trayFile = sticker.trays[packId - 1];
          const stickersFiles = sticker.stickers[packId - 1];

          const base64s = await Promise.all([trayFile, ...stickersFiles].map(file => {
            const localPath = `${__dirname}/../..${file}`;
            return util.promisify(fs.readFile)(localPath).then(buffer => Promise.resolve(buffer.toString('base64')));
          }));

          const tray = base64s[0];
          const stickers = base64s.slice(1);

          const json = {
            identifier: `${sticker.uuid}_${packId}`,
            name: `${sticker.name}${packId === 1 ? '' : ` (${packId})`}`,
            publisher: sticker.publisher,
            tray_image: tray,
            stickers: stickers.map(imageData => ({
              image_data: imageData,
            })),
          };
          await incrementStickerStats(sticker.uuid, 'downloads');
          return res.json(json);
        }
      }
    } catch (e) {
      return res.status(500).json({
        type: TYPES.FAILED_TO_GENERATE_JSON,
        message: MESSAGES.FAILED_TO_GENERATE_JSON,
      });
    }
    next();
  });
  server.use(
    '/api/stickers',
    auth.optional,
    mongooseCrudify({
      Model: Sticker,
      identifyingKey: 'uuid',
      selectFields, // Hide '__v' property
      endResponseInAction: false,

      beforeActions: [
        {
          middlewares: [...helpers.populateAuditFields],
          only: ['create', 'update'],
        },
        {
          middlewares: [...createStickerValidators, generateStickersAndTrayImages],
          only: ['create'],
        },
        {
          middlewares: [...updateStickerValidators],
          only: ['update'],
        },
        {
          middlewares: [...listStickerValidators],
          only: ['list'],
        },
      ],
      actions: {
        // disable update and delete
        update: async (req, res, next) => {
          try {
            const createdBy = req.crudify.sticker.createdBy;
            const userUuid = auth.getUserUUID(req);
            const isAdmin = auth.isAdmin(req);
            if (createdBy === userUuid || isAdmin) {
              req.crudify.sticker.set(req.body);
              req.crudify.result = await req.crudify.sticker.save();
              next();
            } else {
              return res.status(401).json({
                type: TYPES.UNAUTHORIZED_ACTION,
                message: MESSAGES.UNAUTHORIZED_ACTION,
              });
            }
          } catch (e) {
            next(e);
          }
        },
        delete: (req, res) => {
          res.sendStatus(405);
        },
        list: async (req, res, next) => {
          const findConditions = {
            $or: [
              { sharingType: 'public' },
              { sharingType: { $exists: false } },
            ],
          };
          try {
            req.crudify = { result: await Sticker.findWithPagination(findConditions, req.query) };
            next();
          } catch (e) {
            next(e);
          }
        },
      }, // list (GET), create (POST), read (GET), update (PUT), delete (DELETE)
      afterActions: [
        { middlewares: [addToSiteStats], only: ['create'] },
        { middlewares: [addToStickerStats], only: ['read'] },
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

  async function addToSiteStats(req, res, next) {
    try {
      const sticker = req.crudify.result;
      if (sticker.sharingType) {
        const { packs, stickers } = sticker.stats;
        await incrementSiteStats(req.body.sharingType, 'packs', packs);
        await incrementSiteStats(req.body.sharingType, 'stickers', stickers);
      }
      next();
    } catch (e) {
      next(e);
    }
  }

  async function addToStickerStats(req, res, next) {
    try {
      const sticker = req.crudify.result;
      await incrementStickerStats(sticker.uuid, 'views');
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
    const local = `${__dirname}/../..${path}`;
    const file = `/${uuidv4()}.${extension}`;
    const localPath = local + file;
    const dbPath = path + file;

    const data = image.replace(dataUrlRegex, '');
    const buffer = Buffer.from(data, 'base64');

    if (buffer.length > 100 * 1024) {
      throw new ValidationError(MESSAGES.VERIFY_IMAGE);
    }

    if (!fs.existsSync(local)) {
      fs.mkdirSync(local);
    }

    fs.writeFile(localPath, buffer, () => {});
    return dbPath;
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
      req.body.tray = downloadBase64Image(req.body.tray, 'tray', id);
      req.body.uuid = id;
      next();
    } catch (e) {
      next(e);
    }
  }
};
