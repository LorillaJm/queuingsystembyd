// Test ID Number via API calls
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testIdNumber() {
  try {
    console.log('Testing ID Number functionality...\n');
    
    // Step 1: Create a test registration with ID Number
    console.log('1. Creating registration with ID Number...');
    const registrationData = {
      fullName: 'Test ID User',
      mobile: '+639999999999',
      email: 'testid@example.com',
      idNumber: 'N01-99-999999',
      model: 'BYD Atto 3',
      salesConsultant: 'Rynel',
      branch: 'MAIN',
      purpose: 'TEST_DRIVE'
    };
    
    const registerResponse = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    });
    
    const registerResult = await registerResponse.json();
    console.log('Registration response:', registerResult);
    
    if (!registerResult.success) {
      console.log('❌ Registration failed');
      return;
    }
    
    const ticketId = registerResult.data.ticketId;
    console.log(`✅ Registration created with ID: ${ticketId}`);
    console.log(`   ID Number in response: ${registerResult.data.idNumber || 'N/A'}`);
    
    // Step 2: Fetch the registration to verify ID Number is saved
    console.log('\n2. Fetching registration to verify ID Number...');
    const fetchResponse = await fetch(`${API_BASE}/registrations?branch=MAIN`);
    const fetchResult = await fetchResponse.json();
    
    if (fetchResult.success) {
      const testReg = fetchResult.data.registrations.find(r => r.id === ticketId);
      if (testReg) {
        console.log(`✅ Found registration: ${testReg.fullName}`);
        console.log(`   ID Number: ${testReg.idNumber || 'N/A'}`);
        console.log(`   Email: ${testReg.email || 'N/A'}`);
      } else {
        console.log('❌ Registration not found in list');
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testIdNumber();