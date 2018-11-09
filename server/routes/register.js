'use strict';

const mongooseCrudify = require('mongoose-crudify');
const uuidv4 = require('uuid/v4');
const helpers = require('../utils/helpers');
const { StatusError } = require('../errors');
const validators = require('../utils/validators');
const User = require('../models/User');
const fs = require('fs');
const auth = require('../middleware/auth');
const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const { expressValidatorErrorHandler } = require('../utils/expressErrorHandlers');

module.exports = function (server) {

    // Docs: https://github.com/ryo718/mongoose-crudify
    server.post(
        '/api/register',
        auth.optional,
        [
            body('username').isLength({ min: 4, max: 20 }).withMessage('must be within 4 to 20 characters'),
            body('password').isLength({ min: 6 }).withMessage('must be at least 6 characters')
                .custom(validators.usernameIsNotRestrictedValidator).withMessage('is not a valid username'),
            body('confirmPassword').withMessage('is required'),
            body('email').isEmail(),
            body().custom(body => body.password === body.confirmPassword).withMessage('Passwords do not match'),
            sanitizeBody('email').normalizeEmail(),
            expressValidatorErrorHandler,
        ],
        async (req, res, next) => {
            try {
                const { username, password, email } = req.body;
                const uuid = uuidv4();

                const user = await User.findOne({ $or: [{email}, {username}] });
                if (user) {
                    throw new StatusError(400, 'Username or email already exists');
                }

                const newUser = new User({
                    uuid,
                    username,
                    email,
                    createdBy: uuid,
                    updatedBy: uuid,
                });

                newUser.setPassword(password);
                await newUser.save();
                res.json({
                    user: newUser.toAuthJSON(),
                });
            } catch (e) {
                next(e);
            }
        },
    );
};
