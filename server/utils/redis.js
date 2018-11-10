const redis = require('redis');

let redisClient = null;

module.exports = {
  getRedisClient() {
    if (!redisClient) {
      redisClient = redis.createClient({
        host: '127.0.0.1',
        port: 6379,
      });
      redisClient.on('error', console.error);
    }
    return redisClient;
  },
};
