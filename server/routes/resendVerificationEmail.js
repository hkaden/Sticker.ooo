

const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const User = require('../models/User');
const Token = require('../models/Token');
const auth = require('../middleware/auth');
const { expressValidatorErrorHandler } = require('../utils/expressErrorHandlers');
const { sendVerificationEmail } = require('../utils/mailSender');
const { TYPES, MESSAGES } = require('../configs/constants');

module.exports = function (server) {
  // Docs: https://github.com/ryo718/mongoose-crudify
  server.post(
    '/api/resendVerificationEmail',
    auth.optional,
    [
      body('email').withMessage(MESSAGES.IS_REQUIRE),
      body('email').isEmail(),
      sanitizeBody('email').normalizeEmail(),
      expressValidatorErrorHandler,
    ],
    async (req, res, next) => {
      try {
        const { email } = req.body;
        await User.findOne({ email }, (err, user) => {
          if (!user || user.isVerified) {
            return res.status(400).json({
              type: TYPES.INVALID_USER,
              message: MESSAGES.INVALID_USER,
            });
          }

          const token = new Token({
            uuid: user.uuid,
            type: TYPES.RESEND_VERIFICATION
          })

          token.setToken(email);

          return token.save((err) => {
            if (err) {
              return res.status(500).json({
                type: TYPES.FAILED_TO_SEND_TOKEN,
                message: MESSAGES.FAILED_TO_SEND_TOKEN,
              });
            }

            sendVerificationEmail(user.emailExternal || user.email, token.token, req, res);
          });
        });
      } catch (e) {
        next(e);
      }
    },
  );
};
