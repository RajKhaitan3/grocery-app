// ===========================================
// DATABASE CONNECTION
// ===========================================
// WHY this file?
// We separate the DB connection into its own file because:
// 1. It keeps server.js clean and focused
// 2. If we ever need to change databases, we only change this file
// 3. This is a common industry pattern called "Separation of Concerns"
// ===========================================

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // mongoose.connect() returns a promise
    // We use async/await to wait for the connection to finish
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, log the error and stop the server
    // WHY exit? Because our app is useless without a database
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // 1 = exit with failure
  }
};

module.exports = connectDB;
