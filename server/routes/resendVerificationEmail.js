

const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const User = require('../models/User');
const Token = require('../models/Token');
const auth = require('../middleware/auth');
const { expressValidatorErrorHandler } = require('../utils/expressErrorHandlers');
const { sendVerificationMail } = require('../utils/nodeMailer');
const { TYPES, MESSAGES } = require('../configs/constants');

module.exports = function (server) {
  // Docs: https://github.com/ryo718/mongoose-crudify
  server.post(
    '/api/resendVerificationEmail',
    auth.optional,
    [
      body('email').withMessage(MESSAGES.IS_REQUIRE),
      body('email').isEmail(),
      // sanitizeBody('email').normalizeEmail({ remove_dots: false }),
      expressValidatorErrorHandler,
    ],
    async (req, res, next) => {
      try {
        const { email } = req.body;
        await User.findOne({ email }, (err, user) => {
          if (!user) {
            return res.status(400).json({
              type: TYPES.INVALID_USER,
              message: MESSAGES.INVALID_USER,
            });
          }

          const token = new Token({
            uuid: user.uuid
          })

          token.setToken(email);

          return token.save((err) => {
            if (err) {
              return res.status(500).json({
                type: TYPES.FAILED_TO_SEND_TOKEN,
                message: MESSAGES.FAILED_TO_SEND_TOKEN,
              });
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
