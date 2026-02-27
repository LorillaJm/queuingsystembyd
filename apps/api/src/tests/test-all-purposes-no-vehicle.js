// Test all purposes without vehicle selection
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testAllPurposesNoVehicle() {
  try {
    console.log('Testing all purposes without vehicle selection...\n');
    
    const purposes = ['CIS', 'TEST_DRIVE', 'RESERVATION'];
    
    for (let i = 0; i < purposes.length; i++) {
      const purpose = purposes[i];
      console.log(`${i + 1}. Testing ${purpose} without vehicle...`);
      
      const registrationData = {
        fullName: `No Vehicle ${purpose} Test`,
        mobile: `+6395555555${i}${i}`,
        email: `novehicle${purpose.toLowerCase()}@test.com`,
        // No carId or model provided
        salesConsultant: 'Rynel',
        branch: 'MAIN',
        purpose: purpose
      };
      
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`   ✅ SUCCESS: Queue ${result.data.queueNo}`);
        console.log(`   Model: ${result.data.model}`);
        console.log(`   Purpose: ${result.data.purpose}`);
      } else {
        console.log(`   ❌ FAILED: ${result.error}`);
        if (result.details) {
          console.log(`   Details:`, result.details);
        }
      }
      console.log('');
    }
    
    // Test combination of purposes
    console.log('4. Testing multiple purposes without vehicle...');
    const multiPurposeData = {
      fullName: 'Multi Purpose No Vehicle Test',
      mobile: '+639444444444',
      email: 'multipurpose@test.com',
      salesConsultant: 'Mary Joy',
      branch: 'MAIN',
      purpose: 'CIS,TEST_DRIVE'
    };
    
    const multiResponse = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(multiPurposeData)
    });
    
    const multiResult = await multiResponse.json();
    
    if (multiResult.success) {
      console.log(`   ✅ SUCCESS: Queue ${multiResult.data.queueNo}`);
      console.log(`   Model: ${multiResult.data.model}`);
      console.log(`   Purpose: ${multiResult.data.purpose}`);
    } else {
      console.log(`   ❌ FAILED: ${multiResult.error}`);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAllPurposesNoVehicle();