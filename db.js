const mongoose = require('mongoose');

let connectPromise = null;

const connect = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb+srv://shivamvaghela2007_db_user:shivlo%40123@cluster0.sroemva.mongodb.net/';

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
