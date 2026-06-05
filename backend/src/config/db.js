const mongoose = require('mongoose');
const dns = require('dns');

// Use Google's DNS servers to bypass ISP DNS issues
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  const attemptConnection = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        family: 4,
        retryWrites: true,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      retries++;
      if (retries < maxRetries) {
        console.warn(`Connection attempt ${retries}/${maxRetries} failed. Retrying in 3 seconds...`);
        console.warn(`Error: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        return attemptConnection();
      } else {
        console.error(`Failed to connect to MongoDB after ${maxRetries} attempts`);
        console.error(`Error: ${error.message}`);
        // Don't exit - let the server run without database
        console.warn('Server will continue running without database connection');
      }
    }
  };

  await attemptConnection();
};

module.exports = connectDB;
