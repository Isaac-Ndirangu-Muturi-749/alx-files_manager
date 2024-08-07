const request = require('supertest');
const { expect } = require('chai');
const app = require('../../server'); // Your Express app

describe('endpoints', () => {
  let token;
  let userId;
  let fileId;

  before(async () => {
    // Create a user and get a token
    const userRes = await request(app)
      .post('/users')
      .send({ email: 'test@example.com', password: 'password123' });
    userId = userRes.body.id;

    const tokenRes = await request(app)
      .get('/connect')
      .set('Authorization', 'Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZDEyMw==');
    token = tokenRes.body.token;
  });

  after(async () => {
    // Disconnect the user
    await request(app)
      .get('/disconnect')
      .set('X-Token', token);
  });

  it('gET /status should return 200', () => new Promise((done) => {
    request(app)
      .get('/status')
      .expect(200, done);
  }));

  it('gET /stats should return 200', () => new Promise((done) => {
    request(app)
      .get('/stats')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.an('object');
        done();
      });
  }));

  it('pOST /users should create a user', () => new Promise((done) => {
    request(app)
      .post('/users')
      .send({ email: 'newuser@example.com', password: 'password123' })
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property('id');
        done();
      });
  }));

  it('gET /connect should return a token', () => new Promise((done) => {
    request(app)
      .get('/connect')
      .set('Authorization', 'Basic bmV3dXNlckBleGFtcGxlLmNvbTpwYXNzd29yZDEyMw==')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property('token');
        done();
      });
  }));

  it('gET /disconnect should return 204', () => new Promise((done) => {
    request(app)
      .get('/disconnect')
      .set('X-Token', token)
      .expect(204, done);
  }));

  it('gET /users/me should return user info', () => new Promise((done) => {
    request(app)
      .get('/users/me')
      .set('X-Token', token)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property('id', userId);
        done();
      });
  }));

  it('pOST /files should create a file', () => new Promise((done) => {
    request(app)
      .post('/files')
      .set('X-Token', token)
      .send({
        name: 'test.txt',
        type: 'file',
        data: Buffer.from('Hello World').toString('base64'),
        isPublic: true,
      })
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property('id');
        fileId = res.body.id;
        done();
      });
  }));

  it('gET /files/:id should return file info', () => new Promise((done) => {
    request(app)
      .get(`/files/${fileId}`)
      .set('X-Token', token)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property('id', fileId);
        done();
      });
  }));

  it('gET /files should return list of files', () => new Promise((done) => {
    request(app)
      .get('/files')
      .set('X-Token', token)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.an('array');
        done();
      });
  }));

  it('pUT /files/:id/publish should publish the file', () => new Promise((done) => {
    request(app)
      .put(`/files/${fileId}/publish`)
      .set('X-Token', token)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property('isPublic', true);
        done();
      });
  }));

  it('pUT /files/:id/unpublish should unpublish the file', () => new Promise((done) => {
    request(app)
      .put(`/files/${fileId}/unpublish`)
      .set('X-Token', token)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property('isPublic', false);
        done();
      });
  }));

  it('gET /files/:id/data should return file content', () => new Promise((done) => {
    request(app)
      .get(`/files/${fileId}/data`)
      .set('X-Token', token)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).to.equal('Hello World');
        done();
      });
  }));

  it('gET /files/:id/data?size=100 should return thumbnail content', () => new Promise((done) => {
    request(app)
      .get(`/files/${fileId}/data?size=100`)
      .set('X-Token', token)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.headers['content-type']).to.match(/image\/.*/);
        done();
      });
  }));
});
