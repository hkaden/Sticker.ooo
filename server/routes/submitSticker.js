'use strict';

const mongooseCrudify = require('mongoose-crudify');
const uuidv4 = require('uuid/v4');
const helpers = require('../services/helpers');
const Sticker = require('../models/Sticker');
const fs = require('fs');

module.exports = function (server) {

    // Docs: https://github.com/ryo718/mongoose-crudify
    server.use(
        '/api/submitsticker',
        mongooseCrudify({
            Model: Sticker,
            selectFields: '-__v', // Hide '__v' property
            endResponseInAction: false,

            beforeActions: [{
                middlewares: [generateStickersAndTrayImages]
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

    /**
     * Generate sticker and tray images
     * and set uuid before inserting into db
     */
    function generateStickersAndTrayImages (req, res, next) {
        var id = uuidv4();

        req.body.stickers.map((stickerPack, stickerPackIndex) => stickerPack.map((image, itemIndex) => {
            let path = '/static/imageStore/stickers/' + id;
            let fd = downloadBase64Image(image, path);
            req.body.stickers[stickerPackIndex][itemIndex] = fd;
        }));

        req.body.tray.map((image, itemIndex) => {
            let path = '/static/imageStore/tray/' + id;
            let fd = downloadBase64Image(image, path);
            req.body.tray[itemIndex] = fd;
        });

        req.body.uuid = id;
        next();
    }

    /**
     * Download Images to target path from a base64 string 
     * and return its relative path
     */
    function downloadBase64Image (image, path) {
        let data = image.replace(/^data:image\/\w+;base64,/, "");
        let buffer = new Buffer(data, 'base64');
        let local = __dirname + '/../..' + path;
        let file =  '/' + uuidv4() + '.png';
        let localPath = local + file;
        let dbPath = path + file;

        if (!fs.existsSync(local)){
            fs.mkdirSync(local);
        }
        fs.writeFile(localPath, buffer);
        return dbPath; 
    }

};
