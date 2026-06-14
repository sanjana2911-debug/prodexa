/**
 * Database cleanup script
 * Deletes all documents from all collections while keeping indexes
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const mongoose = require('mongoose');

const cleanup = async () => {
  try {
    const db = mongoose.connection;
    
    // Get MongoDB URI from env
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('MONGODB_URI not found in environment');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get all collection names from the database
    const collections = await db.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    console.log('Found collections:', collectionNames.join(', '));

    // Collections to clear (all data collections, not system ones)
    const dataCollections = collectionNames.filter(name => 
      !name.startsWith('system.')
    );

    let totalDeleted = 0;
    const results = [];

    for (const name of dataCollections) {
      const result = await db.db.collection(name).deleteMany({});
      totalDeleted += result.deletedCount;
      results.push({ collection: name, deleted: result.deletedCount });
    }

    console.log('\n=== Cleanup Results ===');
    results.forEach(r => {
      console.log(`${r.collection}: ${r.deleted} documents deleted`);
    });
    console.log(`\nTotal: ${totalDeleted} documents deleted across ${results.length} collections`);
    console.log('All indexes preserved. Database structure intact.');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
};

cleanup();