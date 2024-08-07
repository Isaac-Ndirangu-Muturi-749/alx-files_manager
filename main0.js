// main.js
const redisClient = require('./utils/redis');

(async () => {
  console.log(redisClient.isAlive()); // Should print: true
  console.log(await redisClient.get('myKey')); // Should print: null
  await redisClient.set('myKey', 12, 5);
  console.log(await redisClient.get('myKey')); // Should print: 12

  setTimeout(async () => {
    console.log(await redisClient.get('myKey')); // Should print: null (after 10 seconds)
  }, 1000 * 10);
})();
