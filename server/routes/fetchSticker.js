'use strict';

const mongooseCrudify = require('mongoose-crudify');

const helpers = require('../services/helpers');
const Sticker = require('../models/Sticker');

module.exports = function (server) {

    // Docs: https://github.com/ryo718/mongoose-crudify
    server.use(
        '/api/fetchsticker',
        mongooseCrudify({
            Model: Sticker,
            identifyingKey: 'uuid',
            selectFields: '-__v', // Hide '__v' property
            endResponseInAction: false,

            // beforeActions: [],
            // actions: {}, // list (GET), create (POST), read (GET), update (PUT), delete (DELETE)
            afterActions: [
                { middlewares: [helpers.formatResponse] },
            ],
        })
    );

};
