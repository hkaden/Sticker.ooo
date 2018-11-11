const { param } = require('express-validator/check');
const Sticker = require('../models/Sticker');
const { expressValidatorErrorHandler } = require('../utils/expressErrorHandlers');
const { getSiteStats, getStickerStatsGrouped, incrementStickerStats } = require('../utils/statisticsHelper');

module.exports = (server) => {
  server.get(
    '/api/statistics/stickers',
    async (req, res, next) => {
      try {
        res.json(await getSiteStats());
      } catch (e) {
        next(e);
      }
    },
  );
  server.get(
    '/api/statistics/stickers/:uuid',
    [
      param('uuid').isUUID(),
      expressValidatorErrorHandler,
    ],
    async (req, res, next) => {
      try {
        res.json(await getStickerStatsGrouped(req.params.uuid));
      } catch (e) {
        next(e);
      }
    },
  );
  server.post(
    '/api/statistics/stickers/:uuid/:field',
    [
      param('uuid').isUUID(),
      param('field').isIn(['download', 'view']),
      expressValidatorErrorHandler,
    ],
    async (req, res, next) => {
      try {
        await incrementStickerStats(req.params.uuid, `${req.params.field}s`);
        res.sendStatus(200);
      } catch (e) {
        next(e);
      }
    },
  );
};
