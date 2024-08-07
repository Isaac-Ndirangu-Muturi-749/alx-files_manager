// worker.js
const Bull = require('bull');
const { ObjectId } = require('mongodb');
const dbClient = require('./utils/db');

const userQueue = new Bull('userQueue');
const fileQueue = new Bull('fileQueue');

userQueue.process(async (job, done) => {
  const { userId } = job.data;

  if (!userId) {
    return done(new Error('Missing userId'));
  }

  const user = await dbClient.db.collection('users').findOne({ _id: new ObjectId(userId) });

  if (!user) {
    return done(new Error('User not found'));
  }

  console.log(`Welcome ${user.email}!`);
  done();
});

fileQueue.process(async (job, done) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    return done(new Error('Missing fileId'));
  }

  if (!userId) {
    return done(new Error('Missing userId'));
  }

  const fileDocument = await dbClient.db.collection('files').findOne({
    _id: new ObjectId(fileId),
    userId: new ObjectId(userId),
  });

  if (!fileDocument) {
    return done(new Error('File not found'));
  }

  const imageThumbnail = require('image-thumbnail');

  try {
    const thumbnail500 = await imageThumbnail(fileDocument.localPath, { width: 500 });
    const thumbnail250 = await imageThumbnail(fileDocument.localPath, { width: 250 });
    const thumbnail100 = await imageThumbnail(fileDocument.localPath, { width: 100 });

    fs.writeFileSync(`${fileDocument.localPath}_500`, thumbnail500);
    fs.writeFileSync(`${fileDocument.localPath}_250`, thumbnail250);
    fs.writeFileSync(`${fileDocument.localPath}_100`, thumbnail100);

    done();
  } catch (error) {
    done(error);
  }
});

console.log('Worker started');
