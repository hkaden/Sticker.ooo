

const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const User = require('../models/User');
const Token = require('../models/Token');
const auth = require('../middleware/auth');
const { expressValidatorErrorHandler } = require('../utils/expressErrorHandlers');
const { sendEmail } = require('../utils/mailSender');
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

            let subject = 'Sticker.ooo Email Verification';
            let content = `${'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/'}${req.headers.host}\/api\/verifyAccount\/${token.token}.\n`;
            let successReturn = {
              type: TYPES.VERIFICATION_EMAIL_SENT,
              message: MESSAGES.VERIFICATION_EMAIL_SENT_SUCCESS + user.emailExternal,
            };
            let failedReturn = {
              type: TYPES.FAILED_TO_SEND_VERIFICATION_EMAIL,
              message: MESSAGES.FAILED_TO_SEND_VERIFICATION_EMAIL,
            };
            sendEmail(user.emailExternal, subject, content, req, res, successReturn, failedReturn);
          });
        });
      } catch (e) {
        next(e);
      }
    },
  );
};
