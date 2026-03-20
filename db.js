const mongoose = require('mongoose');

let connectPromise = null;

const connect = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://localhost:27017/radheKrishna';

  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    if (!connectPromise) {
      connectPromise = mongoose.connect(mongoUri).then((conn) => {
        console.log('Connected to MongoDB');
        return conn;
      });
    }

    return await connectPromise;
  } catch (err) {
    connectPromise = null;
    console.error('Failed to connect to MongoDB', err);
    throw err;
  }
};

module.exports = {connect};
