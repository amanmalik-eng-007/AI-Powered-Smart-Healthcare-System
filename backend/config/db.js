const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-healthcare';
    console.log(`Connecting to MongoDB at: ${connUri}`);
    
    // Connect to MongoDB
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000 // Time out after 5s instead of hanging
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Running backend in offline/fallback database mode or local MongoDB fallback. Ensure MongoDB is running locally.');
    // In production we would exit, but for this project we'll allow server to boot so APIs can be tested or mock services can execute
    // process.exit(1);
  }
};

module.exports = connectDB;
