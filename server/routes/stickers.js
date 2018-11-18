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

const getStickerJsonValidators = [
  param('uuid').isUUID().withMessage(MESSAGES.IS_UUID),
  param('packId').isInt().withMessage(MESSAGES.IS_UUID).toInt(),
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

const listStickerValidators = [
  query('limit').optional().toInt().custom(v => v >= 1 && v <= 20)
    .withMessage(MESSAGES.VERIFY_QUERY_LIMIT),
  query('offset').optional().toInt().custom(v => v >= 0)
    .withMessage(MESSAGES.VERIFY_QUERY_OFFSET),
  query('sort').optional().isString()
    .isIn([...siteStatsFields, 'popular', 'latest', 'updatedAt', 'createdAt'])
    .withMessage(MESSAGES.VERIFY_QUERY_SORT),
  query('order').optional().isString().customSanitizer(v => v.toLowerCase())
    .isIn(['asc', 'desc'])
    .withMessage(MESSAGES.VERIFY_QUERY_ORDER),
  expressValidatorErrorHandler,
];

module.exports = (server) => {
  // Docs: https://github.com/ryo718/mongoose-crudify
  const selectFields = '-__v';
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
          middlewares: [...listStickerValidators],
          only: ['list'],
        },
      ],
      actions: {
        // disable update and delete
        update: (req, res) => {
          res.sendStatus(405);
        },
        delete: (req, res) => {
          res.sendStatus(405);
        },
        list: async (req, res, next) => {
          const listDefaults = {
            limit: 10,
            offset: 0,
            sort: 'createdAt',
            order: 'desc',
          };
          const options = {
            ...listDefaults,
            ...req.query,
          };

          options.sort = siteStatsFields.includes(options.sort) ? `stats.${options.sort}` : options.sort;
          options.sort = options.sort === 'popular' ? 'stats.weeklyDownloads' : options.sort;
          if (options.sort === 'popular') {
            options.sort = 'stats.weeklyDownloads';
          } else if (options.sort === 'latest') {
            options.sort = 'updatedAt';
          }

          const findConditions = {
            $or: [
              { sharingType: 'public' },
              { sharingType: { $exists: false } },
            ],
          };

          try {
            let query = Sticker.find(findConditions)
              .limit(options.limit)
              .skip(options.offset)
              .sort({ [options.sort]: (options.order === 'asc' ? 1 : -1) })
              .select(selectFields)
              // .populate({path: 'createdByUser', select: 'username uuid'});

            let docs = await query;

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
