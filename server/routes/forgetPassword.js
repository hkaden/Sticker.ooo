

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
    '/api/forgetPassword',
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
          if (!user || !user.isVerified) {
            return res.status(400).json({
              type: TYPES.INVALID_USER,
              message: MESSAGES.FAILED_TO_MATCH_USER,
            });
          }
          const token = new Token({
            uuid: user.uuid,
            type: TYPES.FORGET_PASSWORD
          });

          token.setToken(email);
          token.save((err) => {
            if(err) {
              return res.status(400).json({
                type: TYPES.FAILED_TO_SET_TOKEN,
                message: MESSAGES.FAILED_TO_SET_TOKEN,
              });
            }

            let subject = 'Forget Password';
            let content = `${'Hello,\n\n' + 'You recently have requested to reset password. Please do it by clicking the link: \nhttp:\/\/'}${req.headers.host}\/api\/resetPassword\/${token.token}.\n`;
            let successReturn = {
              type: TYPES.RESET_PASSWORD_EMAIL_SENT,
              message: MESSAGES.RESET_PASSWORD_EMAIL_SENT_SUCCESS + (user.emailExternal || user.email),
            };
            let failedReturn = {
              type: TYPES.FAILED_TO_SEND_RESET_PASSWORD_EMAIL,
              message: MESSAGES.FAILED_TO_SEND_RESET_PASSWORD_EMAIL,
            };
            sendEmail(user.emailExternal || user.email, subject, content, req, res, successReturn, failedReturn);
          });

           });
      } catch (e) {
        next(e);
      }
    },
  );
};
