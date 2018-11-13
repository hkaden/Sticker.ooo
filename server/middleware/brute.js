const { getRedisClient } = require('../utils/redis');
const ExpressBrute = require('express-brute');
const RedisStore = require('express-brute-redis');

let store = null;


if (process.env.NODE_ENV !== 'production') {
  store = new ExpressBrute.MemoryStore();
} else {
  store = new RedisStore({
    client: getRedisClient(),
    prefix: 'brute-',
  });
}

const failCallback = (req, res, next, nextValidRequestDate) => res.status(401).json({
  message: 'You\'ve made too many failed attempts in a short period of time',
});

const handleStoreError = (error) => {
  res.status(400).json({
    message: error.message,
    parent: error.parent,
  });
};

const loginBruteforce = new ExpressBrute(store, {
  freeRetries: 5,
  minWait: 5 * 60 * 1000, // 5 minutes
  maxWait: 60 * 60 * 1000, // 1 hour
  failCallback,
  handleStoreError,
});

const globalBruteforce = new ExpressBrute(store, {
  freeRetries: 1000,
  attachResetToRequest: false,
  refreshTimeoutOnRequest: false,
  minWait: 25 * 60 * 60 * 1000, // 1 day 1 hour
  maxWait: 25 * 60 * 60 * 1000, // 1 day 1 hour
  lifetime: 24 * 60 * 60, // 1 day
  failCallback,
  handleStoreError,
});


module.exports = {
  loginBruteforce,
  globalBruteforce,
};
