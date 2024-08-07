// routes/tests/dbClient.test.js
const dbClient = require('../utils/db');

describe('dbClient', () => {
  beforeAll(async () => {
    await dbClient.init();
  });

  it('isAlive returns true', () => {
    expect.assertions(1);
    expect(dbClient.isAlive()).toBe(true);
  });

  it('nbUsers returns number of users', async () => {
    expect.assertions(1);
    const nbUsers = await dbClient.nbUsers();
    expect(nbUsers).toBeGreaterThanOrEqual(0);
  });
});
