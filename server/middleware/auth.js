const jwt = require('express-jwt');
const _ = require('lodash');
const fs = require('fs');

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
const cert = fs.readFileSync(`${__dirname}/../public.pem`);

const auth = {
  required: jwt({
    secret: cert,
    userProperty: 'payload',
    getToken: getTokenFromCookies,
    algorithm: 'RS256',
  }),
  optional: jwt({
    secret: cert,
    userProperty: 'payload',
    getToken: getTokenFromCookies,
    credentialsRequired: false,
    algorithm: 'RS256',
  }),
  getUserUUID: req => _.get(req, 'payload.uuid', null),
};

module.exports = auth;
