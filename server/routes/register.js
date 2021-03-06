

const uuidv4 = require('uuid/v4');
const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const normalizeEmail = require('validator/lib/normalizeEmail')
const { StatusError } = require('../errors');
const validators = require('../utils/validators');
const User = require('../models/User');
const Token = require('../models/Token');
const auth = require('../middleware/auth');
const { expressValidatorErrorHandler } = require('../utils/expressErrorHandlers');
const { sendVerificationEmail } = require('../utils/mailSender');
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
      expressValidatorErrorHandler,
    ],
    async (req, res, next) => {
      try {
        const { username, password } = req.body;
        let { email } = req.body;
        const emailExternal = email;
        email = normalizeEmail(email);
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
          emailExternal,
          createdBy: uuid,
          updatedBy: uuid,
          role: ['user']
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

            sendVerificationEmail(emailExternal, token.token, req, res);
          });
        });
      } catch (e) {
        next(e);
      }
    },
  );
};
