

const brute = require('../middleware/brute');
const auth = require('../middleware/auth');
const { TYPES, MESSAGES } = require('../configs/constants');

module.exports = function (server) {
  server.post(
    '/api/logout',
    auth.required,
    brute.globalBruteforce.prevent,
    (req, res, next) => {
      const cookie = req.cookies;
      for (var prop in cookie) {
          if (!cookie.hasOwnProperty(prop)) {
              continue;
          }    
          res.cookie(prop, '', {expires: new Date(0)});
      }
      return res.status(200).json({
        type: TYPES.LOGGED_OUT_SUCCESS,
        message: MESSAGES.LOGGED_OUT_SUCCESS
      });
    }
  );
};
