// Test the public registrations endpoint used by summary page
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testSummaryAPI() {
  try {
    console.log('Testing summary page API...\n');
    
    // Test the public registrations endpoint
    const response = await fetch(`${API_BASE}/public/registrations?branch=MAIN`);
    const result = await response.json();
    
    console.log('Public registrations response:', result.success);
    
    if (result.success && result.data && result.data.length > 0) {
      console.log(`Found ${result.data.length} registrations`);
      
      // Check the first few registrations for ID Number
      for (let i = 0; i < Math.min(3, result.data.length); i++) {
        const reg = result.data[i];
        console.log(`\nRegistration ${i + 1}:`);
        console.log(`  Queue: ${reg.queueNo}`);
        console.log(`  Name: ${reg.fullName}`);
        console.log(`  Email: ${reg.email || 'N/A'}`);
        console.log(`  ID Number: ${reg.idNumber || 'N/A'}`);
        console.log(`  Purpose: ${reg.purpose}`);
      }
      
      // Look for our test registration
      const testReg = result.data.find(r => r.fullName === 'Test ID User');
      if (testReg) {
        console.log(`\n✅ Found test registration:`);
        console.log(`   ID Number: ${testReg.idNumber || 'N/A'}`);
      }
    } else {
      console.log('❌ No registrations found or API error');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testSummaryAPI();