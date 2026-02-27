// Test the updated registrations endpoint with includeAll parameter
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testSummaryWithAll() {
  try {
    console.log('Testing /api/registrations with includeAll=true...\n');
    
    const response = await fetch(`${API_BASE}/registrations?branch=MAIN&includeAll=true`);
    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response success:', result.success);
    
    if (result.success && result.data && result.data.registrations) {
      console.log(`Found ${result.data.registrations.length} registrations (including all statuses)`);
      
      // Count by status
      const statusCounts = {};
      result.data.registrations.forEach(reg => {
        statusCounts[reg.status] = (statusCounts[reg.status] || 0) + 1;
      });
      
      console.log('\nStatus breakdown:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
      
      // Look for our test registration
      const testReg = result.data.registrations.find(r => r.fullName === 'Test ID User');
      if (testReg) {
        console.log(`\n✅ Found test registration:`);
        console.log(`   Queue: ${testReg.queueNo}`);
        console.log(`   ID Number: ${testReg.idNumber || 'N/A'}`);
        console.log(`   Status: ${testReg.status}`);
      }
      
      // Check a few registrations for ID Number
      console.log('\nSample registrations:');
      for (let i = 0; i < Math.min(3, result.data.registrations.length); i++) {
        const reg = result.data.registrations[i];
        console.log(`  ${reg.queueNo}: ${reg.fullName} - ID: ${reg.idNumber || 'N/A'} - Status: ${reg.status}`);
      }
      
    } else {
      console.log('❌ No registrations found or API error');
      console.log('Full response:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testSummaryWithAll();