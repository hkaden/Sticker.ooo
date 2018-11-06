'use strict';

const mongooseCrudify = require('mongoose-crudify');
const uuidv4 = require('uuid/v4');
const helpers = require('../services/helpers');
const User = require('../models/User');
const fs = require('fs');

module.exports = function (server) {

    // Docs: https://github.com/ryo718/mongoose-crudify
    server.use(
        '/api/register',
        mongooseCrudify({
            Model: User,
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

    function uuidGenerator(req, res, next) {
        var id = uuidv4();
        req.body.uuid = id;
    }

    function modifyQueryResult (req, res) {

    }

};
