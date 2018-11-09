'use strict';

const mongooseCrudify = require('mongoose-crudify');
const uuidv4 = require('uuid/v4');
const helpers = require('../utils/helpers');
const validators = require('../utils/validators');
const User = require('../models/User');
const fs = require('fs');
const auth = require('../middleware/auth');

module.exports = function (server) {

    // Docs: https://github.com/ryo718/mongoose-crudify
    server.use(
        '/api/register',
        auth.optional,
        mongooseCrudify({
            Model: User,
            selectFields: '-__v', // Hide '__v' property
            endResponseInAction: false,

            beforeActions: [{
                middlewares: [uuidGenerator, validateRegistration]
            }],
            // actions: {}, // list (GET), create (POST), read (GET), update (PUT), delete (DELETE)
            afterActions: [
                { middlewares: [helpers.formatResponse] },
            ],
        })
    );

    function uuidGenerator(req, res, next) {
        var id = uuidv4();
        req.body.uuid = id;
        next();
    }

    function validateRegistration(req, res, next) {
        let username = req.body.username;
        let password = req.body.password;
        let confirmPassword = req.body.confirmPassword;
        let email = req.body.email;
        let uuid = req.body.uuid;

        if(!username) {
            return res.status(422).json({
                error: 'Username is required'
            })
        }
        const displayName = username;
        username = username.toLowerCase();

        if(!password) {
            return res.status(422).json({
                error: 'password is required'
            })
        }

        if(!confirmPassword) {
            return res.status(422).json({
                error: 'confirmPassword is required'
            })
        }

        if(!email) {
            return res.status(422).json({
                error: 'email is required'
            })
        }

        if (validators.usernameValidator(username) || !validators.usernameIsNotRestrictedValidator(username)) {
            return res.status(400).json({
                error: 'Invalid username'
            });
        }

        if(!validators.emailValidator(email)){
            return res.status(400).json({
                error: 'Invalid email'
            });
        }

        if(password !== confirmPassword) {
            return res.status(400).json({
                error: 'Passwords do not match'
            })
        }

        User.findOne( {username} )
            .then( (user) => {
                if(!user) {
                    const newUser = new User({
                        uuid,
                        username,
                        displayName,
                        email,
                        createdBy: username,
                        updatedBy: username,
                    });

                    newUser.setPassword(password);
                    return newUser.save()
                        .then(() => res.json({
                            user: newUser.toAuthJSON()
                        }))
                }
                return res.status(400).json({
                    error: 'Failed to register'
                })
            }).catch((e) => {
            return res.status(400).json({
                error: 'Failed to register'
            })
        })
    }
};
