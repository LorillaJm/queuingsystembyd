import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the api root directory (go up from src/tests to apps/api)
const envPath = resolve(__dirname, '../../.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

async function testMongoDBConnection() {
  console.log('🔍 Testing MongoDB Atlas Connection...\n');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables!');
    console.error('💡 Make sure .env file exists in apps/api/ directory\n');
    process.exit(1);
  }
  
  console.log('Connection String:', process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@'));
  console.log('');

  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log('✅ MongoDB connected successfully!\n');

    // Test database operations
    console.log('📊 Testing database operations...');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    console.log('');

    // Test write operation
    console.log('✍️  Testing write operation...');
    const testCollection = mongoose.connection.db.collection('connection_test');
    const testDoc = { 
      test: true, 
      timestamp: new Date(),
      message: 'Connection test successful'
    };
    await testCollection.insertOne(testDoc);
    console.log('✅ Write operation successful');

    // Test read operation
    console.log('📖 Testing read operation...');
    const doc = await testCollection.findOne({ test: true });
    console.log('✅ Read operation successful');
    console.log('   Document:', doc);
    console.log('');

    // Clean up test document
    await testCollection.deleteOne({ _id: doc._id });
    console.log('🧹 Cleaned up test document\n');

    console.log('🎉 All tests passed! MongoDB Atlas is working correctly.\n');

  } catch (error) {
    console.error('❌ MongoDB connection failed!\n');
    console.error('Error:', error.message);
    console.error('');
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.error('💡 Troubleshooting tips:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify MongoDB Atlas IP whitelist (should include 0.0.0.0/0 for testing)');
      console.error('   3. Check if your firewall is blocking MongoDB connections');
      console.error('   4. Verify the connection string is correct');
    } else if (error.message.includes('authentication')) {
      console.error('💡 Authentication failed - check username/password in connection string');
    }
    
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
  }
}

testMongoDBConnection();
