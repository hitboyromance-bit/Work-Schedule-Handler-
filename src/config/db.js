const mongoose = require('mongoose');

async function connectDb(mongoUri) {
  await mongoose.connect(mongoUri);
  return mongoose.connection;
}

module.exports = { connectDb };
