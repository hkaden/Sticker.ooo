

const { body } = require('express-validator/check');
const normalizeEmail = require('validator/lib/normalizeEmail')
const { expressValidatorErrorHandler } = require('../utils/expressErrorHandlers');
const { sendContactUsEmail } = require('../utils/mailSender');
const auth = require('../middleware/auth');
const { TYPES, MESSAGES } = require('../configs/constants');

module.exports = function (server) {
  server.post(
    '/api/contactUs',
    auth.optional,
    [
      body('email').isEmail(),
      body('subject').isLength({ min: 2 }).withMessage(MESSAGES.IS_REQUIRE),
      body('message').isLength({ min: 2 }).withMessage(MESSAGES.IS_REQUIRE),
      expressValidatorErrorHandler,
    ],
    async (req, res, next) => {
      try {
        let { email, subject, message } = req.body;
        email = normalizeEmail(email);
        await sendContactUsEmail(email, subject, message, req, res);
      } catch (e) {
        next(e);
      }
    },
  );
};
