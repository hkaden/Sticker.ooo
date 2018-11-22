

const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const User = require('../models/User');
const Token = require('../models/Token');
const auth = require('../middleware/auth');
const { expressValidatorErrorHandler } = require('../utils/expressErrorHandlers');
const { TYPES, MESSAGES } = require('../configs/constants');
const { requestParameterValidator } = require('../utils/validators');

module.exports = function (server) {
  // Docs: https://github.com/ryo718/mongoose-crudify
  server.get(
    '/api/verifyAccount/*',
    auth.optional,
    [
      //body('token').withMessage(MESSAGES.IS_REQUIRE),
      // body('email').isEmail(),
      // sanitizeBody('email').normalizeEmail({ remove_dots: false }),
      expressValidatorErrorHandler,
    ],
    async (req, res, next) => {
      let type = TYPES.ACCOUNT_NOT_VERIFIED;
      let success = false;
      try {
        // const { token } = req.body;
        let token = requestParameterValidator(req.path.substr(req.path.lastIndexOf('/') + 1));
        const tokenObj = await Token.findOne({ token, type: TYPES.REGISTER });
        if (!tokenObj) {
          type = TYPES.INVALID_TOKEN;
        } else {
          const user = await User.findOne({ uuid: tokenObj.uuid });
          if (!user) {
            type = TYPES.ACCOUNT_NOT_MATCH_TOKEN;
          } else if (user.isVerified) {
            success = true;
            type = TYPES.ACCOUNT_ALREADY_BEEN_VERIFIED;
          } else {
            user.isVerified = true;
            await user.save();
            type = TYPES.ACCOUNT_VERIFIED;
            success = true;
          }
        }
      } catch (e) {
      }
      return res.redirect(`/login?type=${type}&success=${success}`);
    },
  );
};
