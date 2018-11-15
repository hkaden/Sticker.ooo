

const uuidv4 = require('uuid/v4');
const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const { StatusError } = require('../errors');
const validators = require('../utils/validators');
const User = require('../models/User');
const Token = require('../models/Token');
const auth = require('../middleware/auth');
const { expressValidatorErrorHandler } = require('../utils/expressErrorHandlers');
const { sendEmail } = require('../utils/mailSender');
const { TYPES, MESSAGES } = require('../configs/constants');

module.exports = function (server) {
  // Docs: https://github.com/ryo718/mongoose-crudify
  server.post(
    '/api/register',
    auth.optional,
    [
      body('username').isLength({ min: 4, max: 20 }).withMessage(MESSAGES.VERIFY_USERNAME)
      .custom(validators.usernameIsNotRestrictedValidator)
      .withMessage(MESSAGES.IS_NOT_VALID_USERNAME),
      body('password').isLength({ min: 6 }).withMessage(MESSAGES.VERFIY_PASSWORD),
      body('confirmPassword').withMessage(MESSAGES.IS_REQUIRE),
      body('email').isEmail(),
      body().custom(body => body.password === body.confirmPassword).withMessage(MESSAGES.PASSWORD_NOT_MATCH),
      // sanitizeBody('email').normalizeEmail({ remove_dots: false }),
      expressValidatorErrorHandler,
    ],
    async (req, res, next) => {
      try {
        const { username, password, email } = req.body;
        const uuid = uuidv4();

        const user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
          return res.status(400).json({
            type: TYPES.USERNAME_OR_EMAIL_EXIST,
            message: MESSAGES.USERNAME_OR_EMAIL_EXIST,
          });
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
          if (err) {
            return res.status(500).send({
              type: TYPES.FAILED_TO_REGISTER,
              message: MESSAGES.FAILED_TO_REGISTER,
            });
          }

          const token = new Token({
            uuid,
            type: TYPES.REGISTER
          });

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
              message: MESSAGES.VERIFICATION_EMAIL_SENT_SUCCESS + email
            };
            let failedReturn = {
              type: TYPES.FAILED_TO_SEND_VERIFICATION_EMAIL,
              message: MESSAGES.FAILED_TO_SEND_VERIFICATION_EMAIL,
            };
            sendEmail(email, subject, content, req, res, successReturn, failedReturn);
          });
        });
      } catch (e) {
        next(e);
      }
    },
  );
};
