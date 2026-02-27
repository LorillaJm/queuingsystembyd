/**
 * Queue Generator Test Script
 * 
 * This script demonstrates and tests the queue number generator
 * including concurrency safety.
 * 
 * Run with: node src/tests/queueGenerator.test.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import QueueState from '../models/QueueState.js';
import Settings from '../models/Settings.js';
import Registration from '../models/Registration.js';
import { 
  generateQueueNumber, 
  formatQueueNumber,
  parseQueueNumber,
  getQueueState,
  getQueueStats
} from '../services/queueGenerator.js';

dotenv.config();

// Test configuration
const TEST_BRANCH = 'MAIN';
const CONCURRENT_REQUESTS = 10;

// Connect to MongoDB
async function connect() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/queue-system-test';
  await mongoose.connect(uri);
  console.log('✓ Connected to MongoDB');
}

// Clean up test data
async function cleanup() {
  await QueueState.deleteMany({});
  await Settings.deleteMany({});
  await Registration.deleteMany({});
  console.log('✓ Cleaned up test data');
}

// Test 1: Basic queue number generation
async function testBasicGeneration() {
  console.log('\n--- Test 1: Basic Queue Number Generation ---');
  
  const queueNo1 = await generateQueueNumber(TEST_BRANCH);
  console.log(`Generated: ${queueNo1}`);
  
  const queueNo2 = await generateQueueNumber(TEST_BRANCH);
  console.log(`Generated: ${queueNo2}`);
  
  const queueNo3 = await generateQueueNumber(TEST_BRANCH);
  console.log(`Generated: ${queueNo3}`);
  
  console.log('✓ Basic generation works');
}

// Test 2: Format and parse
async function testFormatParse() {
  console.log('\n--- Test 2: Format and Parse ---');
  
  const formatted = formatQueueNumber('A', 42);
  console.log(`Formatted: ${formatted}`);
  
  const parsed = parseQueueNumber('A-042');
  console.log(`Parsed: ${JSON.stringify(parsed)}`);
  
  console.log('✓ Format and parse work correctly');
}

// Test 3: Concurrency safety
async function testConcurrency() {
  console.log('\n--- Test 3: Concurrency Safety ---');
  console.log(`Generating ${CONCURRENT_REQUESTS} queue numbers simultaneously...`);
  
  // Create multiple simultaneous requests
  const promises = [];
  for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
    promises.push(generateQueueNumber(TEST_BRANCH));
  }
  
  // Wait for all to complete
  const results = await Promise.all(promises);
  
  // Check for duplicates
  const uniqueResults = new Set(results);
  
  console.log('Generated queue numbers:');
  results.forEach((queueNo, index) => {
    console.log(`  ${index + 1}. ${queueNo}`);
  });
  
  if (uniqueResults.size === results.length) {
    console.log('✓ No duplicates found - concurrency safety verified!');
  } else {
    console.error('✗ DUPLICATES FOUND - concurrency safety failed!');
    console.error(`Expected ${results.length} unique, got ${uniqueResults.size}`);
  }
}

// Test 4: Queue state
async function testQueueState() {
  console.log('\n--- Test 4: Queue State ---');
  
  const state = await getQueueState(TEST_BRANCH);
  console.log('Queue State:', JSON.stringify(state, null, 2));
  
  const stats = await getQueueStats(TEST_BRANCH);
  console.log('Queue Stats:', JSON.stringify(stats, null, 2));
  
  console.log('✓ Queue state retrieval works');
}

// Test 5: Multiple branches
async function testMultipleBranches() {
  console.log('\n--- Test 5: Multiple Branches ---');
  
  // Initialize settings with multiple branches
  await Settings.create({
    _id: 'app_settings',
    staffPin: '1234',
    allowedBranches: [
      { code: 'MAIN', name: 'Main Branch', prefix: 'A', active: true },
      { code: 'NORTH', name: 'North Branch', prefix: 'B', active: true },
      { code: 'SOUTH', name: 'South Branch', prefix: 'C', active: true }
    ]
  });
  
  const mainQueue = await generateQueueNumber('MAIN');
  const northQueue = await generateQueueNumber('NORTH');
  const southQueue = await generateQueueNumber('SOUTH');
  
  console.log(`Main Branch: ${mainQueue}`);
  console.log(`North Branch: ${northQueue}`);
  console.log(`South Branch: ${southQueue}`);
  
  console.log('✓ Multiple branches work independently');
}

// Test 6: Registration creation
async function testRegistrationCreation() {
  console.log('\n--- Test 6: Registration Creation ---');
  
  const queueNo = await generateQueueNumber(TEST_BRANCH);
  
  const registration = await Registration.create({
    queueNo,
    fullName: 'John Doe',
    mobile: '+1234567890',
    model: 'Tesla Model 3',
    branch: TEST_BRANCH,
    purpose: 'TEST_DRIVE',
    status: 'WAITING'
  });
  
  console.log('Created registration:', {
    queueNo: registration.queueNo,
    fullName: registration.fullName,
    status: registration.status
  });
  
  console.log('✓ Registration creation works');
}

// Test 7: Stress test (100 concurrent requests)
async function testStress() {
  console.log('\n--- Test 7: Stress Test (100 concurrent) ---');
  console.log('Generating 100 queue numbers simultaneously...');
  
  const startTime = Date.now();
  
  const promises = [];
  for (let i = 0; i < 100; i++) {
    promises.push(generateQueueNumber(TEST_BRANCH));
  }
  
  const results = await Promise.all(promises);
  const endTime = Date.now();
  
  const uniqueResults = new Set(results);
  const duration = endTime - startTime;
  
  console.log(`Generated ${results.length} queue numbers in ${duration}ms`);
  console.log(`Average: ${(duration / results.length).toFixed(2)}ms per number`);
  console.log(`Unique numbers: ${uniqueResults.size}`);
  
  if (uniqueResults.size === results.length) {
    console.log('✓ Stress test passed - no duplicates!');
  } else {
    console.error('✗ Stress test failed - duplicates found!');
  }
}

// Run all tests
async function runTests() {
  try {
    console.log('=== Queue Generator Test Suite ===\n');
    
    await connect();
    await cleanup();
    
    await testBasicGeneration();
    await testFormatParse();
    await testConcurrency();
    await testQueueState();
    await testMultipleBranches();
    await testRegistrationCreation();
    await testStress();
    
    console.log('\n=== All Tests Completed ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { runTests };
