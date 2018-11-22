const _ = require('lodash');
const { param } = require('express-validator/check');
const Sticker = require('../models/Sticker');
const auth = require('../middleware/auth');
const { expressValidatorErrorHandler, expressValidatorSanitizer } = require('../utils/expressErrorHandlers');
const { MESSAGES } = require('../configs/constants');
const { siteStatsFields } = require('../utils/statisticsHelper');
const { paginationValidators } = require('../utils/validators')

const listStickerValidators = [
  ...paginationValidators([...siteStatsFields, 'popular', 'latest', 'updatedAt', 'createdAt']),
  expressValidatorErrorHandler,
];

module.exports = (server) => {
  server.get(
    '/api/users/me/stickers',
    auth.required,
    listStickerValidators,
    async (req, res, next) => {
      const findConditions = {
        createdBy: req.payload.uuid,
      };
      try {
        res.json(await Sticker.findWithPagination(findConditions, req.query));
      } catch (e) {
        next(e);
      }
    },
  );
  server.get(
    '/api/users/:uuid/stickers',
    [
      param('uuid').isUUID().withMessage(MESSAGES.IS_UUID),
      ...listStickerValidators,
    ],
    async (req, res, next) => {
      const findConditions = {
        createdBy: req.params.uuid,
        $or: [
          { sharingType: 'public' },
          { sharingType: { $exists: false } },
        ],
      };
      try {
        res.json(await Sticker.findWithPagination(findConditions, req.query));
      } catch (e) {
        next(e);
      }
    },
  );
};
