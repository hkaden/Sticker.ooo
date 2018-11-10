

const passport = require('passport');
const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const brute = require('../middleware/brute');
const auth = require('../middleware/auth');
const { expressValidatorErrorHandler } = require('../utils/expressErrorHandlers');
const { TYPES, MESSAGES } = require('../configs/constants');

module.exports = function (server) {
  // Docs: https://github.com/ryo718/mongoose-crudify
  server.post(
    '/api/login',
    auth.optional,
    brute.globalBruteforce.prevent,
    brute.loginBruteforce.getMiddleware({
      key(req, res, next) {
        next(req.body.username);
      },
    }),
    [
      body('email').isEmail(),
      body('password').isString(),
      sanitizeBody('email').normalizeEmail(),
      expressValidatorErrorHandler,
    ],
    (req, res, next) => passport.authenticate('local', { session: false }, (err, passportUser, info) => {
      if (err) {
        return next(err);
      }

      if (passportUser) {
        const user = passportUser;
        return req.brute.reset(() => {
          if (!user.isVerified) {
            return res.status(401).json({
              type: TYPES.ACCOUNT_NOT_VERIFIED,
              message: MESSAGES.ACCOUNT_NOT_VERIFIED,
            });
          }
          user.token = passportUser.generateJWT();
          return res.status(200).json({
            type: TYPES.LOGIN_SUCCESS,
            message: MESSAGES.LOGIN_SUCCESS,
            user: user.toAuthJSON(),
          });
        });
      }

      return res.status(400).json({
        type: TYPES.FAILED_TO_LOGIN,
        message: MESSAGES.FAILED_TO_LOGIN,
      });
    })(req, res, next),
  );
};
