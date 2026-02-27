/**
 * Concurrency Safety Demonstration
 * 
 * This script visually demonstrates how MongoDB's atomic operations
 * prevent race conditions when generating queue numbers.
 * 
 * Run with: node src/tests/concurrency-demo.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import QueueState from '../models/QueueState.js';
import Settings from '../models/Settings.js';
import { generateQueueNumber } from '../services/queueGenerator.js';

dotenv.config();

const BRANCH = 'DEMO';
const CONCURRENT_REQUESTS = 20;

async function connect() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/queue-system-test';
  await mongoose.connect(uri);
}

async function cleanup() {
  await QueueState.deleteMany({});
  await Settings.deleteMany({});
  
  // Create demo branch
  await Settings.create({
    _id: 'app_settings',
    staffPin: '1234',
    allowedBranches: [
      { code: 'DEMO', name: 'Demo Branch', prefix: 'D', active: true }
    ]
  });
}

async function demonstrateConcurrency() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     CONCURRENCY SAFETY DEMONSTRATION                   ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  console.log('SCENARIO:');
  console.log(`${CONCURRENT_REQUESTS} users click "Register" at the EXACT same time.`);
  console.log('Each needs a unique queue number.\n');
  
  console.log('WITHOUT atomic operations:');
  console.log('  ❌ Multiple requests read lastNumber = 0');
  console.log('  ❌ All increment to 1');
  console.log('  ❌ All get D-001 (DUPLICATE!)');
  console.log('  ❌ Race condition = data corruption\n');
  
  console.log('WITH MongoDB atomic $inc:');
  console.log('  ✓ MongoDB locks the document');
  console.log('  ✓ Each request waits its turn');
  console.log('  ✓ Each gets unique sequential number');
  console.log('  ✓ No duplicates possible\n');
  
  console.log('─'.repeat(60));
  console.log(`Simulating ${CONCURRENT_REQUESTS} simultaneous requests...\n`);
  
  const startTime = Date.now();
  
  // Create array to track request timing
  const requests = [];
  
  // Launch all requests simultaneously
  const promises = Array.from({ length: CONCURRENT_REQUESTS }, (_, i) => {
    const requestId = i + 1;
    const requestStart = Date.now();
    
    return generateQueueNumber(BRANCH).then(queueNo => {
      const requestEnd = Date.now();
      const duration = requestEnd - requestStart;
      
      return {
        requestId,
        queueNo,
        duration,
        timestamp: requestEnd
      };
    });
  });
  
  // Wait for all to complete
  const results = await Promise.all(promises);
  
  const endTime = Date.now();
  const totalDuration = endTime - startTime;
  
  // Sort by completion time to show order
  results.sort((a, b) => a.timestamp - b.timestamp);
  
  console.log('RESULTS (in order of completion):');
  console.log('─'.repeat(60));
  
  results.forEach(({ requestId, queueNo, duration }) => {
    console.log(`Request #${String(requestId).padStart(2)} → ${queueNo} (${duration}ms)`);
  });
  
  console.log('─'.repeat(60));
  
  // Verify uniqueness
  const queueNumbers = results.map(r => r.queueNo);
  const uniqueNumbers = new Set(queueNumbers);
  
  console.log('\nVERIFICATION:');
  console.log(`  Total requests:    ${CONCURRENT_REQUESTS}`);
  console.log(`  Unique numbers:    ${uniqueNumbers.size}`);
  console.log(`  Duplicates:        ${CONCURRENT_REQUESTS - uniqueNumbers.size}`);
  console.log(`  Total time:        ${totalDuration}ms`);
  console.log(`  Avg per request:   ${(totalDuration / CONCURRENT_REQUESTS).toFixed(2)}ms`);
  
  if (uniqueNumbers.size === CONCURRENT_REQUESTS) {
    console.log('\n✅ SUCCESS! All queue numbers are unique!');
    console.log('   MongoDB atomic operations prevented race conditions.\n');
  } else {
    console.log('\n❌ FAILURE! Duplicates detected!');
    console.log('   This should never happen with atomic operations.\n');
  }
  
  // Show the atomic operation details
  console.log('─'.repeat(60));
  console.log('HOW IT WORKS (MongoDB Atomic Operation):');
  console.log('─'.repeat(60));
  console.log(`
  QueueState.findOneAndUpdate(
    { branch: 'DEMO', dateKey: '2024-01-01' },
    { $inc: { lastNumber: 1 } },  // ← ATOMIC INCREMENT
    { new: true, upsert: true }
  )
  
  Key points:
  1. $inc is an ATOMIC operation at database level
  2. MongoDB locks the document during update
  3. Concurrent requests are serialized automatically
  4. Each request gets a unique incremented value
  5. No application-level locking needed
  6. Works across multiple server instances
  `);
  
  console.log('─'.repeat(60));
  console.log('COMPARISON WITH OTHER APPROACHES:');
  console.log('─'.repeat(60));
  console.log(`
  ❌ Read-Modify-Write (UNSAFE):
     const state = await QueueState.findOne(...);
     state.lastNumber += 1;  // ← RACE CONDITION!
     await state.save();
  
  ❌ Application-level locks (COMPLEX):
     await acquireLock();
     // ... generate number ...
     await releaseLock();
     // Doesn't work across multiple servers
  
  ✅ MongoDB Atomic $inc (SAFE & SIMPLE):
     await QueueState.findOneAndUpdate(
       { ... },
       { $inc: { lastNumber: 1 } }
     );
     // Works perfectly, no extra code needed
  `);
}

async function run() {
  try {
    await connect();
    await cleanup();
    await demonstrateConcurrency();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

run();
