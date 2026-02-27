// Test the registrations endpoint used by summary page
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testRegistrationsEndpoint() {
  try {
    console.log('Testing /api/registrations endpoint...\n');
    
    const response = await fetch(`${API_BASE}/registrations?branch=MAIN`);
    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response success:', result.success);
    
    if (result.success && result.data && result.data.registrations) {
      console.log(`Found ${result.data.registrations.length} registrations`);
      
      // Check the first few registrations for ID Number
      for (let i = 0; i < Math.min(3, result.data.registrations.length); i++) {
        const reg = result.data.registrations[i];
        console.log(`\nRegistration ${i + 1}:`);
        console.log(`  Queue: ${reg.queueNo}`);
        console.log(`  Name: ${reg.fullName}`);
        console.log(`  Email: ${reg.email || 'N/A'}`);
        console.log(`  ID Number: ${reg.idNumber || 'N/A'}`);
        console.log(`  Status: ${reg.status}`);
      }
      
      // Look for our test registration
      const testReg = result.data.registrations.find(r => r.fullName === 'Test ID User');
      if (testReg) {
        console.log(`\n✅ Found test registration:`);
        console.log(`   ID Number: ${testReg.idNumber || 'N/A'}`);
        console.log(`   Status: ${testReg.status}`);
      }
    } else {
      console.log('❌ No registrations found or API error');
      console.log('Full response:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testRegistrationsEndpoint();