'use strict';

const User = require('../models/User');
const Token = require('../models/Token');
const auth = require('../middleware/auth');
const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const { expressValidatorErrorHandler } = require('../utils/expressErrorHandlers');

module.exports = function (server) {

    // Docs: https://github.com/ryo718/mongoose-crudify
    server.post(
        '/api/verifyAccount',
        auth.optional,
        [
            body('token').withMessage('is required'),
            //body('email').isEmail(),
            //sanitizeBody('email').normalizeEmail({ remove_dots: false }),
            expressValidatorErrorHandler,
        ],
        async (req, res, next) => {
            try {
                const { token } = req.body;
                await Token.findOne({ token }, (err, token) => {
                    if(!token) {
                        return res.status(400).json({
                            type: 'account-not-verified',
                            message: 'Invalid Token'
                        })
                    }

                    User.findOne({ uuid: token.uuid }, (err, user) => {
                        if(!user) {
                            return res.status(400).json({
                                type: 'account-not-match-with-token',
                                message: 'Failed to match user'
                            })
                        }

                        if(user.isVerified) {
                            return res.status(400).json({
                                type: 'account-already-verified',
                                message: 'The account has already been verified'
                            })
                        }

                        user.isVerified = true;
                        user.save((err) => {
                            if(err) {
                                return res.status(500).json({
                                    type: 'account-not-verified',
                                    message: 'Failed to verify the account'
                                })
                            }

                            return res.status(200).json({
                                type: 'account-verified',
                                message: 'The account has been verified'
                            })
                        });
                    });
                    
                });
            } catch (e) {
                next(e);
            }
        },
    );
};
