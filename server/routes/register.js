'use strict';

const uuidv4 = require('uuid/v4');
const { StatusError } = require('../errors');
const validators = require('../utils/validators');
const User = require('../models/User');
const Token = require('../models/Token');
const auth = require('../middleware/auth');
const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const { expressValidatorErrorHandler } = require('../utils/expressErrorHandlers');
const { sendVerificationMail } = require('../utils/nodeMailer');

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
            //sanitizeBody('email').normalizeEmail({ remove_dots: false }),
            expressValidatorErrorHandler,
        ],
        async (req, res, next) => {
            try {
                const { username, password, email } = req.body;
                const uuid = uuidv4();
                console.log("email=" + email)
                const user = await User.findOne({ $or: [{email}, {username}] });
                if (user) {
                    return res.status(400).json({
                        message: 'Username or email already exists'
                    })
                }

                const newUser = new User({
                    uuid,
                    username,
                    email,
                    createdBy: uuid,
                    updatedBy: uuid,
                });

                newUser.setPassword(password);
                
                return await newUser.save((err) => {
                    if(err) {
                        return res.status(500).send({
                            message: 'Failed to register'
                        })
                    }

                    const token = new Token({
                        uuid
                    })

                    token.setToken(email);
                    
                    return token.save((err) => {
                        if(err) {
                            return res.status(500).json({
                                message: err.message
                            })
                        }

                        sendVerificationMail(email, token, req, res);
                    });
                });
            } catch (e) {
                next(e);
            }
        },
    );
};
