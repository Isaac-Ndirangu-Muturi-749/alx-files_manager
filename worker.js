// worker.js
const Bull = require('bull');
const fs = require('fs');
const imageThumbnail = require('image-thumbnail');
const { ObjectId } = require('mongodb');
const dbClient = require('./utils/db');

const fileQueue = new Bull('fileQueue');

fileQueue.process(async (job, done) => {
  const { fileId, userId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const fileDocument = await dbClient.db.collection('files').findOne({ _id: new ObjectId(fileId), userId: new ObjectId(userId) });

  if (!fileDocument) {
    throw new Error('File not found');
  }

  const { localPath } = fileDocument;
  const sizes = [500, 250, 100];

  for (const size of sizes) {
    try {
      const thumbnail = await imageThumbnail(localPath, { width: size });
      const thumbnailPath = `${localPath}_${size}`;
      fs.writeFileSync(thumbnailPath, thumbnail);
    } catch (error) {
      console.error(`Error generating thumbnail for size ${size}:`, error);
    }
  }

  done();
});

console.log('Worker started');
