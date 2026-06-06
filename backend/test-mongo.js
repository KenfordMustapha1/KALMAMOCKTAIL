require('dotenv').config();
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = require('./src/config/db');

console.log('Testing MongoDB connection...');

connectDB().then((connected) => {
  if (connected) {
    console.log('MongoDB connected successfully');
    process.exit(0);
  }

  console.error('MongoDB connection failed');
  process.exit(1);
});
