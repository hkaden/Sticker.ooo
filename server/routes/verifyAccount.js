'use strict';

const User = require('../models/User');
const Token = require('../models/Token');
const auth = require('../middleware/auth');
const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const { expressValidatorErrorHandler } = require('../utils/expressErrorHandlers');
const { TYPES, MESSAGES } = require('../configs/constants');

module.exports = function (server) {

    // Docs: https://github.com/ryo718/mongoose-crudify
    server.post(
        '/api/verifyAccount',
        auth.optional,
        [
            body('token').withMessage(MESSAGES.IS_REQUIRE),
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
                            type: TYPES.ACCOUNT_NOT_VERIFIED,
                            message: MESSAGES.INVALID_TOKEN
                        })
                    }

                    User.findOne({ uuid: token.uuid }, (err, user) => {
                        if(!user) {
                            return res.status(400).json({
                                type: TYPES.ACCOUNT_NOT_MATCH_TOKEN,
                                message: MESSAGES.FAILED_TO_MATCH_USER
                            })
                        }

                        if(user.isVerified) {
                            return res.status(400).json({
                                type: TYPES.ACCOUNT_ALREADY_BEEN_VERIFIED,
                                message: MESSAGES.ACCOUNT_ALREADY_BEEN_VERIFIED
                            })
                        }

                        user.isVerified = true;
                        user.save((err) => {
                            if(err) {
                                return res.status(500).json({
                                    type: TYPES.ACCOUNT_NOT_VERIFIED,
                                    message: MESSAGES.FAILED_TO_VERIFY_ACCOUNT
                                })
                            }

                            return res.status(200).json({
                                type: TYPES.ACCOUNT_VERIFIED,
                                message: MESSAGES.ALREADY_VERIFIED
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
