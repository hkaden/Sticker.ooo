const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
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
  getUserUUID: req => _.get(req, 'payload.uuid', null),
};

module.exports = auth;
