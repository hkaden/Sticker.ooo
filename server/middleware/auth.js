const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const User = require('../models/User');
const { TYPES, MESSAGES } = require('../configs/constants');
const cert = require('../public');

// const getTokenFromHeaders = (req) => {
//   const { headers: { authorization } } = req;
//   if (authorization && authorization.split(' ')[0] === 'Bearer') {
//     return authorization.split(' ')[1];
//   }
//   return null;
// };

const getTokenFromCookies = (req) => {
  const cookie = req.cookies.jwtToken;
  if (cookie != null) {
    return cookie;
  }
  return null;
};

const auth = {
  required: expressJwt({
    secret: cert,
    userProperty: 'payload',
    getToken: getTokenFromCookies,
    algorithm: 'RS256',
  }),
  optional: expressJwt({
    secret: cert,
    userProperty: 'payload',
    getToken: getTokenFromCookies,
    credentialsRequired: false,
    algorithm: 'RS256',
  }),
  verifyJwt: (token, callback) => jwt.verify(token, cert, { algorithm: 'RS256' }, callback),
  requiredAdminRole: (req, res, next) => {
    const cookie = req.cookies.jwtToken;
    if (cookie == undefined) {
      return res.status(401).json({
        type: TYPES.UNAUTHORIZED_ACTION,
        message: MESSAGES.UNAUTHORIZED_ACTION,
      })
    } else {
      // console.log("here")
      // verifyJwt(cookie, (err, payload) => {
      //   console.log(err)
      //   console.log(payload)
      // })
      // next();
      const user = new User();
      const payload = user.verifyJWT(cookie);
      if(payload == null) {
        return res.status(400).json({
          type: TYPES.FAILED_TO_VERIFY_JWT_TOKEN,
          message: MESSAGES.FAILED_TO_VERIFY_JWT_TOKEN,
        })
      } else {
        if(payload.role && payload.role == 'admin'){
          next()
        } else {
          return res.status(401).json({
            type: TYPES.UNAUTHORIZED_ACTION,
            message: MESSAGES.UNAUTHORIZED_ACTION,
          })
        }
      }
    }
  },
  getUserUUID: req => _.get(req, 'payload.uuid', null),
};

module.exports = auth;
