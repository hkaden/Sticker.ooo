'use strict';

const mongooseCrudify = require('mongoose-crudify');
const uuidv4 = require('uuid/v4');
const helpers = require('../services/helpers');
const User = require('../models/User');
const fs = require('fs');
const auth = require('../middleware/auth');

module.exports = function (server) {

    // Docs: https://github.com/ryo718/mongoose-crudify
    server.use(
        '/api/login',
        auth.optional,
        mongooseCrudify({
            Model: User,
            selectFields: '-__v', // Hide '__v' property
            endResponseInAction: false,

            beforeActions: [{
                middlewares: []
            }],
            // actions: {}, // list (GET), create (POST), read (GET), update (PUT), delete (DELETE)
            afterActions: [
                { middlewares: [helpers.formatResponse, modifyQueryResult] },
            ],
        })
    );

    function modifyQueryResult (req, res) {

    }

};
