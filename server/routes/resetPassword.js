

const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const User = require('../models/User');
const Token = require('../models/Token');
const auth = require('../middleware/auth');
const { expressValidatorErrorHandler } = require('../utils/expressErrorHandlers');
const { TYPES, MESSAGES } = require('../configs/constants');
const { requestParameterValidator } = require('../utils/validators');

module.exports = function (server) {
  server.post(
    '/api/resetPassword',
    auth.optional,
    [
      body('token').withMessage(MESSAGES.IS_REQUIRE),
      body('password').isLength({ min: 6 }).withMessage(MESSAGES.VERFIY_PASSWORD),
      body('confirmPassword').isLength({ min: 6 }).withMessage(MESSAGES.IS_REQUIRE),
      body().custom(body => body.password === body.confirmPassword).withMessage(MESSAGES.PASSWORD_NOT_MATCH),
      expressValidatorErrorHandler,
    ],
    async (req, res, next) => {
      try {
        const { token, password } = req.body;
        const tokenObj = await Token.findOne({ token,  type: TYPES.FORGET_PASSWORD});
        if (!tokenObj) {
          return res.status(400).json({
            type: TYPES.INVALID_TOKEN,
            message: MESSAGES.INVALID_TOKEN,
          });
        } else {
          const user = await User.findOne({ uuid: tokenObj.uuid });
          if (!user) {
            return res.status(400).json({
              type: TYPES.ACCOUNT_NOT_MATCH_TOKEN,
              message: MESSAGES.ACCOUNT_NOT_MATCH_TOKEN,
            });
          } else {
            user.setPassword(password);
            await user.save( (err) => {
              if(err) {
                console.err(err);
                return res.status(500).json({
                  type: TYPES.FAILED_TO_RESET_PASSWORD,
                  message: MESSAGES.FAILED_TO_RESET_PASSWORD,
                });
              }

              tokenObj.remove((err) => {
                if(err) {
                  console.err(err);
                  return res.status(500).json({
                    type: TYPES.FAILED_TO_RESET_PASSWORD,
                    message: MESSAGES.FAILED_TO_RESET_PASSWORD,
                  });
                }

                return res.status(200).json({
                  type: TYPES.RESET_PASSWORD_SUCCESS,
                  message: MESSAGES.RESET_PASSWORD_SUCCESS,
                });
              })
            });
          }
        }
      } catch (e) {
        console.error(e);
        return res.status(500).json({
          type: TYPES.FAILED_TO_RESET_PASSWORD,
          message: MESSAGES.FAILED_TO_RESET_PASSWORD,
        });
      }
    },
  );
};
