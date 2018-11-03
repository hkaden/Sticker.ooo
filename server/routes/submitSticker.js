'use strict';

const mongooseCrudify = require('mongoose-crudify');
const uuidv4 = require('uuid/v4');
const helpers = require('../services/helpers');
const Sticker = require('../models/Sticker');

module.exports = function (server) {

    // Docs: https://github.com/ryo718/mongoose-crudify
    server.use(
        '/api/submitsticker',
        mongooseCrudify({
            Model: Sticker,
            selectFields: '-__v', // Hide '__v' property
            endResponseInAction: false,

            beforeActions: [{
                middlewares: [uuidGenerator]
            }],
            // actions: {}, // list (GET), create (POST), read (GET), update (PUT), delete (DELETE)
            afterActions: [
                { middlewares: [helpers.formatResponse, modifyQueryResult] },
            ],
        })
    );

    function formatBase64 (req, res, next) {
        req.body.stickers.map((stickerPack,stickerPackIndex) => stickerPack.map((item, itemIndex) => {
            req.body.stickers[stickerPackIndex][itemIndex] = req.body.stickers[stickerPackIndex][itemIndex].split(',')[1]
        }));
        req.body.tray.map((item, index) => {
            req.body.tray[index] = req.body.tray[index].split(',')[1]
        })
        next()
    }

    function modifyQueryResult (req, res) {

    }

    function uuidGenerator (req, res, next) {
        req.body.uuid = uuidv4();
        next()
    }

};
