const dns = require('dns');
const mongoose = require('mongoose');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (dnsErr) {
  console.warn(`Warning: Could not set custom DNS servers: ${dnsErr.message}`);
}

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  
  if (primaryUri) {
    try {
      console.log('Attempting to connect to MongoDB Atlas...');
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`MongoDB Connected (Atlas): ${conn.connection.host}`);
      return;
    } catch (error) {
      console.warn(`\nMongoDB Atlas connection failed: ${error.message}`);
      console.log('Falling back to local in-memory MongoDB server for development...\n');
    }
  } else {
    console.log('No MONGO_URI specified. Starting local in-memory MongoDB server...\n');
  }

  // In-memory fallback only for development
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: MongoDB Atlas connection failed in production. Exiting.');
    process.exit(1);
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    console.log(`Starting in-memory MongoDB instance...`);
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected (In-Memory Fallback): ${conn.connection.host}`);

    // Seed the database
    console.log('Seeding in-memory database...');
    const { seedData } = require('../scripts/seed');
    await seedData();
  } catch (fallbackError) {
    console.error(`MongoDB Fallback Connection Error: ${fallbackError.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
