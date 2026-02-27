#!/usr/bin/env node
/**
 * Quick Test Script
 * 
 * Quickly test queue generation without full test suite.
 * 
 * Usage:
 *   node src/tests/quick-test.js
 *   node src/tests/quick-test.js --concurrent 50
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import QueueState from '../models/QueueState.js';
import Settings from '../models/Settings.js';
import Registration from '../models/Registration.js';
import { generateQueueNumber, getQueueStats } from '../services/queueGenerator.js';

dotenv.config();

const args = process.argv.slice(2);
const concurrentFlag = args.indexOf('--concurrent');
const concurrentCount = concurrentFlag !== -1 ? parseInt(args[concurrentFlag + 1]) || 10 : 10;

async function quickTest() {
  console.log('🚀 Quick Queue Generator Test\n');
  
  // Connect
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/queue-system-test';
  await mongoose.connect(uri);
  console.log('✓ Connected to MongoDB\n');
  
  // Cleanup
  await QueueState.deleteMany({});
  await Settings.deleteMany({});
  await Registration.deleteMany({});
  
  // Initialize settings
  await Settings.create({
    _id: 'app_settings',
    staffPin: '1234',
    allowedBranches: [
      { code: 'MAIN', name: 'Main Branch', prefix: 'A', active: true },
      { code: 'NORTH', name: 'North Branch', prefix: 'B', active: true }
    ]
  });
  console.log('✓ Initialized settings\n');
  
  // Test 1: Single generation
  console.log('Test 1: Single generation');
  const queue1 = await generateQueueNumber('MAIN');
  console.log(`  Generated: ${queue1}\n`);
  
  // Test 2: Sequential generation
  console.log('Test 2: Sequential generation');
  for (let i = 0; i < 3; i++) {
    const queueNo = await generateQueueNumber('MAIN');
    console.log(`  ${i + 2}. ${queueNo}`);
  }
  console.log();
  
  // Test 3: Concurrent generation
  console.log(`Test 3: Concurrent generation (${concurrentCount} simultaneous)`);
  const startTime = Date.now();
  
  const promises = Array.from({ length: concurrentCount }, () => 
    generateQueueNumber('MAIN')
  );
  
  const results = await Promise.all(promises);
  const duration = Date.now() - startTime;
  
  const uniqueResults = new Set(results);
  
  console.log(`  Generated ${results.length} numbers in ${duration}ms`);
  console.log(`  Unique: ${uniqueResults.size}`);
  console.log(`  Duplicates: ${results.length - uniqueResults.size}`);
  
  if (uniqueResults.size === results.length) {
    console.log('  ✅ No duplicates - concurrency safe!\n');
  } else {
    console.log('  ❌ Duplicates found - FAILED!\n');
  }
  
  // Test 4: Multiple branches
  console.log('Test 4: Multiple branches');
  const mainQueue = await generateQueueNumber('MAIN');
  const northQueue = await generateQueueNumber('NORTH');
  console.log(`  Main: ${mainQueue}`);
  console.log(`  North: ${northQueue}\n`);
  
  // Test 5: Full registration
  console.log('Test 5: Full registration creation');
  const queueNo = await generateQueueNumber('MAIN');
  const registration = await Registration.create({
    queueNo,
    fullName: 'Test User',
    mobile: '+1234567890',
    model: 'Test Model',
    branch: 'MAIN',
    purpose: 'TEST_DRIVE',
    status: 'WAITING'
  });
  console.log(`  Created: ${registration.queueNo} - ${registration.fullName}\n`);
  
  // Show stats
  console.log('Queue Statistics:');
  const stats = await getQueueStats('MAIN');
  console.log(`  Branch: ${stats.branch}`);
  console.log(`  Date: ${stats.dateKey}`);
  console.log(`  Total Generated: ${stats.totalGenerated}`);
  console.log(`  Max Allowed: ${stats.maxAllowed}`);
  console.log(`  Remaining: ${stats.remaining}`);
  console.log(`  Usage: ${stats.percentageFull}%\n`);
  
  // Cleanup and disconnect
  await mongoose.connection.close();
  console.log('✓ Test completed successfully!');
}

quickTest().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});
