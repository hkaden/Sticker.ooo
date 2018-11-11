const jwt = require('express-jwt');

// const getTokenFromHeaders = (req) => {
//   const { headers: { authorization } } = req;
//   if (authorization && authorization.split(' ')[0] === 'Bearer') {
//     return authorization.split(' ')[1];
//   }
//   return null;
// };

const getTokenFromCookies = (req) => {
  const cookie = req.cookies.jwtToken;
  if(cookie != undefined || cookie != null) {
    return cookie;
  } 
  return null;
};

const auth = {
  required: jwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'payload',
    getToken: getTokenFromCookies,
  }),
  optional: jwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'payload',
    getToken: getTokenFromCookies,
    credentialsRequired: false,
  }),
};

module.exports = auth;
