'use strict';

const auth = require('../middleware/auth');
const brute = require('../middleware/brute');
const passport = require('passport');
const { body } = require('express-validator/check')
const { sanitizeBody } = require('express-validator/filter');
const { expressValidatorErrorHandler } = require('../utils/expressErrorHandlers');

module.exports = function (server) {

    // Docs: https://github.com/ryo718/mongoose-crudify
    server.post(
        '/api/login',
        auth.optional,
        brute.globalBruteforce.prevent,
        brute.loginBruteforce.getMiddleware({
            key: function (req, res, next) {
                next(req.body.username);
            },
        }),
        [
            body('email').isEmail(),
            body('password').isString(),
            sanitizeBody('email').normalizeEmail(),
            expressValidatorErrorHandler,
        ],
        (req, res, next) => {
            return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
                if (err) {
                    return next(err);
                }

                if (passportUser) {
                    const user = passportUser;                    
                    return req.brute.reset(() => {
                        if(!user.isVerified) {
                            return res.status(401).json({
                                type: 'account-not-verified',
                                error: 'Your account has not been verified'
                            })
                        }
                        user.token = passportUser.generateJWT();
                        return res.json({ user: user.toAuthJSON() });
                    });
                }

                return res.status(400).json({
                    error: 'Failed to login',
                });
            })(req, res, next);
        },
    );


};
