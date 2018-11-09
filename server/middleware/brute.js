const ExpressBrute = require('express-brute');
const RedisStore = require('express-brute-redis');
let store = null;


if(process.env.NODE_ENV !== 'production') {
  store = new ExpressBrute.MemoryStore();
} else {
  store = new RedisStore({
    host: '127.0.0.1',
    port: 6379
  });
}

const failCallback = (req, res, next, nextValidRequestDate) => {
  return res.status(401).json({
    error: `You've made too many failed attempts in a short period of time`
  })
};

const handleStoreError = (error) => {
  throw {
    message: error.message,
    parent: error.parent
  };
}

const loginBruteforce = new ExpressBrute(store, {
    freeRetries: 5,
    minWait: 5*60*1000, // 5 minutes
    maxWait: 60*60*1000, // 1 hour
    failCallback: failCallback,
    handleStoreError: handleStoreError
});

const globalBruteforce = new ExpressBrute(store, {
  freeRetries: 1000,
  attachResetToRequest: false,
  refreshTimeoutOnRequest: false,
  minWait: 25*60*60*1000, // 1 day 1 hour
  maxWait: 25*60*60*1000, // 1 day 1 hour
  lifetime: 24*60*60, // 1 day
  failCallback: failCallback,
  handleStoreError: handleStoreError
});


module.exports = {
  loginBruteforce,
  globalBruteforce
};