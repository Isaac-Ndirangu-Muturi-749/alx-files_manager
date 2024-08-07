// routes/tests/redisClient.test.js
const redisClient = require('../utils/redis');

describe('redisClient', () => {
  beforeAll(async () => {
    await redisClient.connect();
  });

  it('isAlive returns true', () => {
    expect.assertions(1);
    expect(redisClient.isAlive()).toBe(true);
  });

  it('get returns null for non-existing key', async () => {
    expect.assertions(1);
    const value = await redisClient.get('non-existing-key');
    expect(value).toBeNull();
  });

  it('set and get work correctly', async () => {
    expect.assertions(2);
    await redisClient.set('key', 'value');
    const value = await redisClient.get('key');
    expect(value).toBe('value');
  });
});
