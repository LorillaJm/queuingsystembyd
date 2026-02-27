// Test complete flow: register with test drive and ID number
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testCompleteFlow() {
  try {
    console.log('Testing complete registration flow with ID Number...\n');
    
    // Step 1: Register with test drive
    console.log('1. Creating registration with test drive...');
    const registrationData = {
      fullName: 'Complete Flow Test',
      mobile: '+639888888888',
      email: 'complete@test.com',
      idNumber: 'N01-88-888888',
      model: 'BYD Dolphin',
      salesConsultant: 'Mary Joy',
      branch: 'MAIN',
      purpose: 'TEST_DRIVE'
    };
    
    const registerResponse = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    });
    
    const registerResult = await registerResponse.json();
    console.log('Registration success:', registerResult.success);
    
    if (registerResult.success) {
      console.log(`✅ Registration created: Queue ${registerResult.data.queueNo}`);
      console.log(`   ID Number: ${registerResult.data.idNumber || 'N/A'}`);
      
      // Step 2: Save test drive documents
      console.log('\n2. Saving test drive documents...');
      const testDriveData = {
        fullName: 'Complete Flow Test',
        mobile: '+639888888888',
        idNumber: 'N01-88-888888',
        idFront: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        idBack: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      };
      
      const testDriveResponse = await fetch(`${API_BASE}/testdrive/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testDriveData)
      });
      
      const testDriveResult = await testDriveResponse.json();
      console.log('Test drive documents saved:', testDriveResult.success);
      
      // Step 3: Check if registration appears in summary with ID Number
      console.log('\n3. Checking summary page data...');
      const summaryResponse = await fetch(`${API_BASE}/registrations?branch=MAIN&includeAll=true`);
      const summaryResult = await summaryResponse.json();
      
      if (summaryResult.success) {
        const testReg = summaryResult.data.registrations.find(r => r.fullName === 'Complete Flow Test');
        if (testReg) {
          console.log(`✅ Found in summary: Queue ${testReg.queueNo}`);
          console.log(`   ID Number: ${testReg.idNumber || 'N/A'}`);
          console.log(`   Email: ${testReg.email || 'N/A'}`);
          console.log(`   Status: ${testReg.status}`);
          
          if (testReg.idNumber === 'N01-88-888888') {
            console.log('\n🎉 SUCCESS: ID Number is properly saved and displayed!');
          } else {
            console.log('\n❌ ISSUE: ID Number not matching');
          }
        } else {
          console.log('❌ Registration not found in summary');
        }
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testCompleteFlow();