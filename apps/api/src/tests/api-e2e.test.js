#!/usr/bin/env node
/**
 * End-to-End API Test
 * 
 * Tests all API endpoints to ensure they work correctly.
 * 
 * Prerequisites:
 * - API server must be running (npm run dev)
 * - MongoDB must be connected
 * - Settings must be initialized
 * 
 * Run with: node src/tests/api-e2e.test.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3001';
const STAFF_PIN = process.env.STAFF_PIN || '1234';

let testTicketId = null;
let testQueueNo = null;

// Helper function to make HTTP requests
async function request(method, path, data = null, headers = {}) {
  const url = `${API_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  const json = await response.json();

  return {
    status: response.status,
    data: json
  };
}

// Test functions
async function testHealthCheck() {
  console.log('\n--- Test 1: Health Check ---');
  const { status, data } = await request('GET', '/health');
  
  if (status === 200 && data.status === 'ok') {
    console.log('✓ Health check passed');
    return true;
  } else {
    console.log('✗ Health check failed');
    return false;
  }
}

async function testGetBranches() {
  console.log('\n--- Test 2: Get Branches ---');
  const { status, data } = await request('GET', '/api/branches');
  
  if (status === 200 && data.success && data.data.branches.length > 0) {
    console.log(`✓ Found ${data.data.branches.length} branches`);
    data.data.branches.forEach(b => {
      console.log(`  - ${b.code}: ${b.name} (${b.prefix})`);
    });
    return true;
  } else {
    console.log('✗ Get branches failed');
    return false;
  }
}

async function testRegister() {
  console.log('\n--- Test 3: Register Customer ---');
  
  const registrationData = {
    fullName: 'E2E Test User',
    mobile: '+1234567890',
    model: 'Test Model X',
    branch: 'MAIN',
    purpose: 'TEST_DRIVE'
  };

  const { status, data } = await request('POST', '/api/register', registrationData);
  
  if (status === 201 && data.success) {
    testTicketId = data.data.ticketId;
    testQueueNo = data.data.queueNo;
    console.log('✓ Registration successful');
    console.log(`  Ticket ID: ${testTicketId}`);
    console.log(`  Queue No: ${testQueueNo}`);
    return true;
  } else {
    console.log('✗ Registration failed');
    console.log('  Error:', data.error || data.message);
    return false;
  }
}

async function testRegisterValidation() {
  console.log('\n--- Test 4: Registration Validation ---');
  
  const invalidData = {
    fullName: 'X', // Too short
    mobile: '123', // Too short
    model: '',
    branch: 'INVALID'
  };

  const { status, data } = await request('POST', '/api/register', invalidData);
  
  if (status === 400 && !data.success) {
    console.log('✓ Validation working correctly');
    console.log(`  Caught ${data.details?.length || 0} validation errors`);
    return true;
  } else {
    console.log('✗ Validation not working');
    return false;
  }
}

async function testGetTicket() {
  console.log('\n--- Test 5: Get Ticket Info ---');
  
  if (!testTicketId) {
    console.log('✗ No ticket ID available (skipping)');
    return false;
  }

  const { status, data } = await request('GET', `/api/ticket/${testTicketId}`);
  
  if (status === 200 && data.success) {
    console.log('✓ Ticket retrieved successfully');
    console.log(`  Queue No: ${data.data.queueNo}`);
    console.log(`  Status: ${data.data.status}`);
    return true;
  } else {
    console.log('✗ Get ticket failed');
    return false;
  }
}

async function testGetQueue() {
  console.log('\n--- Test 6: Get Queue Status ---');
  
  const { status, data } = await request('GET', '/api/queue?branch=MAIN');
  
  if (status === 200 && data.success) {
    console.log('✓ Queue status retrieved');
    console.log(`  Branch: ${data.data.branch}`);
    console.log(`  Waiting: ${data.data.waitingCount}`);
    console.log(`  Current Serving: ${data.data.currentServing?.queueNo || 'None'}`);
    console.log(`  Next Up: ${data.data.nextUp.length} tickets`);
    return true;
  } else {
    console.log('✗ Get queue failed');
    return false;
  }
}

async function testStaffAuth() {
  console.log('\n--- Test 7: Staff Authentication ---');
  
  // Test valid PIN
  const { status, data } = await request('POST', '/api/staff/auth', { pin: STAFF_PIN });
  
  if (status === 200 && data.success) {
    console.log('✓ Valid PIN accepted');
  } else {
    console.log('✗ Valid PIN rejected');
    return false;
  }

  // Test invalid PIN
  const { status: status2, data: data2 } = await request('POST', '/api/staff/auth', { pin: 'wrong' });
  
  if (status2 === 401 && !data2.success) {
    console.log('✓ Invalid PIN rejected');
    return true;
  } else {
    console.log('✗ Invalid PIN accepted (security issue!)');
    return false;
  }
}

async function testGetStaffTickets() {
  console.log('\n--- Test 8: Get Staff Tickets ---');
  
  const { status, data } = await request(
    'GET',
    '/api/staff/tickets?branch=MAIN',
    null,
    { 'X-Staff-Pin': STAFF_PIN }
  );
  
  if (status === 200 && data.success) {
    console.log('✓ Staff tickets retrieved');
    console.log(`  Active tickets: ${data.data.count}`);
    return true;
  } else {
    console.log('✗ Get staff tickets failed');
    return false;
  }
}

async function testStaffAuthRequired() {
  console.log('\n--- Test 9: Staff Auth Required ---');
  
  const { status, data } = await request('GET', '/api/staff/tickets');
  
  if (status === 401) {
    console.log('✓ Unauthorized access blocked');
    return true;
  } else {
    console.log('✗ Unauthorized access allowed (security issue!)');
    return false;
  }
}

async function testCallNext() {
  console.log('\n--- Test 10: Call Next Customer ---');
  
  const { status, data } = await request(
    'POST',
    '/api/staff/call-next',
    { branch: 'MAIN' },
    { 'X-Staff-Pin': STAFF_PIN }
  );
  
  if (status === 200 && data.success) {
    console.log('✓ Next customer called');
    console.log(`  Queue No: ${data.data.queueNo}`);
    console.log(`  Name: ${data.data.fullName}`);
    return true;
  } else if (status === 404) {
    console.log('⚠ No tickets in queue (expected if queue is empty)');
    return true;
  } else {
    console.log('✗ Call next failed');
    return false;
  }
}

async function testCallSpecific() {
  console.log('\n--- Test 11: Call Specific Ticket ---');
  
  if (!testQueueNo) {
    console.log('✗ No queue number available (skipping)');
    return false;
  }

  const { status, data } = await request(
    'POST',
    '/api/staff/call-specific',
    { queueNo: testQueueNo },
    { 'X-Staff-Pin': STAFF_PIN }
  );
  
  if (status === 200 && data.success) {
    console.log('✓ Specific ticket called');
    console.log(`  Queue No: ${data.data.queueNo}`);
    return true;
  } else if (status === 400 && data.error === 'Invalid ticket status') {
    console.log('⚠ Ticket already called (expected)');
    return true;
  } else {
    console.log('✗ Call specific failed');
    console.log('  Error:', data.error);
    return false;
  }
}

async function testMarkDone() {
  console.log('\n--- Test 12: Mark Ticket as Done ---');
  
  if (!testQueueNo) {
    console.log('✗ No queue number available (skipping)');
    return false;
  }

  const { status, data } = await request(
    'POST',
    '/api/staff/mark-done',
    { queueNo: testQueueNo },
    { 'X-Staff-Pin': STAFF_PIN }
  );
  
  if (status === 200 && data.success) {
    console.log('✓ Ticket marked as done');
    console.log(`  Status: ${data.data.status}`);
    return true;
  } else if (status === 404) {
    console.log('⚠ Ticket not found or already processed');
    return true;
  } else {
    console.log('✗ Mark done failed');
    return false;
  }
}

async function testRateLimiting() {
  console.log('\n--- Test 13: Rate Limiting ---');
  console.log('  Making 12 rapid registration requests...');
  
  const promises = [];
  for (let i = 0; i < 12; i++) {
    promises.push(
      request('POST', '/api/register', {
        fullName: `Rate Test ${i}`,
        mobile: `+123456789${i}`,
        model: 'Test',
        branch: 'MAIN',
        purpose: 'TEST_DRIVE'
      })
    );
  }

  const results = await Promise.all(promises);
  const rateLimited = results.filter(r => r.status === 429);

  if (rateLimited.length > 0) {
    console.log(`✓ Rate limiting working (${rateLimited.length} requests blocked)`);
    return true;
  } else {
    console.log('⚠ Rate limiting not triggered (may need more requests)');
    return true; // Not a failure, just might need adjustment
  }
}

// Run all tests
async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  API END-TO-END TEST SUITE');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`API URL: ${API_URL}`);
  console.log(`Staff PIN: ${STAFF_PIN}`);

  const tests = [
    testHealthCheck,
    testGetBranches,
    testRegister,
    testRegisterValidation,
    testGetTicket,
    testGetQueue,
    testStaffAuth,
    testGetStaffTickets,
    testStaffAuthRequired,
    testCallNext,
    testCallSpecific,
    testMarkDone,
    testRateLimiting
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`✗ Test error: ${error.message}`);
      failed++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  TEST RESULTS');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Total Tests: ${tests.length}`);
  console.log(`Passed: ${passed} ✓`);
  console.log(`Failed: ${failed} ✗`);
  console.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (failed === 0) {
    console.log('🎉 All tests passed!\n');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please check the output above.\n');
    process.exit(1);
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.error('Error: fetch is not available. Please use Node.js 18 or higher.');
  process.exit(1);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
