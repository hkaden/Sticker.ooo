'use strict';

const mongooseCrudify = require('mongoose-crudify');
const uuidv4 = require('uuid/v4');
const helpers = require('../utils/helpers');
const User = require('../models/User');
const fs = require('fs');
const auth = require('../middleware/auth');
const brute = require('../middleware/brute');
const passport = require('passport');

module.exports = function (server) {

    // Docs: https://github.com/ryo718/mongoose-crudify
    server.use(
        '/api/login',
        auth.optional,
        brute.globalBruteforce.prevent,
        brute.loginBruteforce.getMiddleware({
            key: function(req, res, next) {
                next(req.body.username);
            }
        }),
        mongooseCrudify({
            Model: User,
            selectFields: '-__v', // Hide '__v' property
            endResponseInAction: false,

            beforeActions: [{
                middlewares: [loginValidator]
            }],
            // actions: {}, // list (GET), create (POST), read (GET), update (PUT), delete (DELETE)
            afterActions: [
                { middlewares: [helpers.formatResponse, modifyQueryResult] },
            ],
        })
    );

    function loginValidator(req, res, next) {
        let username = req.body.username;
        let password = req.body.password;

        if(!username) {
            return res.status(422).json({
                error: 'Username is required'
            })
        }

        if(!password) {
            return res.status(422).json({
                error: 'password is required'
            })
        }

        return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
            if(err) {
              return next(err);
            }
            
            if(passportUser) {
              const user = passportUser;
              user.token = passportUser.generateJWT();
              return req.brute.reset(() => {
                return res.json({ user: user.toAuthJSON() });
              });
            }

            return res.status(400).json({
                error: 'Failed to login'
            });
          })(req, res, next);
    }

    function modifyQueryResult (req, res) {

    }

};
