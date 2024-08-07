// routes/tests/setup.js
const dbClient = require('../../utils/db');
const redisClient = require('../../utils/redis');

beforeAll(async () => {
  await dbClient.init();
  await redisClient.connect();
});

afterAll(async () => {
  await dbClient.close();
  await redisClient.quit();
});
