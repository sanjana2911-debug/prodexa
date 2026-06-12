/**
 * Database configuration
 * Connects to MongoDB Atlas using Mongoose with optimized pool settings
 * for production performance
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection pool configuration for production performance
      maxPoolSize: 10,         // Allow up to 10 concurrent operations
      minPoolSize: 2,          // Keep 2 connections warm (reduces cold-start latency)
      serverSelectionTimeoutMS: 5000,  // Fail fast if MongoDB is unreachable
      heartbeatFrequencyMS: 10000,     // Check connection health every 10s
      socketTimeoutMS: 45000,          // Close idle sockets after 45s
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;