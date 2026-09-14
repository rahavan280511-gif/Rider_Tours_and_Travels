const mongoose = require('mongoose');
const dns = require('dns');

// Force Node.js to use Google DNS to bypass ISP / Mobile network DNS SRV blocking
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  console.warn('Could not set custom DNS servers:', e.message);
}

const connectDB = async () => {
  // Reuse existing database connection in Vercel serverless functions
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const primaryUri = process.env.MONGO_URI;
  
  if (primaryUri) {
    try {
      console.log('Attempting to connect to MongoDB Atlas...');
      
      const connPromise = mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 4000,
        connectTimeoutMS: 4000,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('MongoDB Atlas connection timed out after 5000ms')), 5000)
      );

      const conn = await Promise.race([connPromise, timeoutPromise]);
      console.log(`MongoDB Connected (Atlas): ${conn.connection.host}`);
      return;
    } catch (error) {
      console.warn(`\nMongoDB Atlas connection failed: ${error.message}`);
      console.log('Falling back to local in-memory MongoDB server for development...\n');
      try {
        await mongoose.disconnect();
      } catch (e) {}
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
