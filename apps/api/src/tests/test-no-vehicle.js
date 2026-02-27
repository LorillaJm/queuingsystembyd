// Test registration without vehicle selection
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testNoVehicle() {
  try {
    console.log('Testing registration without vehicle selection...\n');
    
    // Test 1: Registration with empty carId
    console.log('1. Testing with empty carId...');
    const registrationData1 = {
      fullName: 'No Vehicle Test 1',
      mobile: '+639777777777',
      email: 'novehicle1@test.com',
      carId: '', // Empty carId
      salesConsultant: 'Rynel',
      branch: 'MAIN',
      purpose: 'CIS'
    };
    
    const response1 = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData1)
    });
    
    const result1 = await response1.json();
    console.log('Response 1:', result1.success ? 'SUCCESS' : 'FAILED');
    if (!result1.success) {
      console.log('Error:', result1.error);
      console.log('Details:', result1.details);
    }
    
    // Test 2: Registration without carId field
    console.log('\n2. Testing without carId field...');
    const registrationData2 = {
      fullName: 'No Vehicle Test 2',
      mobile: '+639666666666',
      email: 'novehicle2@test.com',
      // No carId field at all
      salesConsultant: 'Mary Joy',
      branch: 'MAIN',
      purpose: 'TEST_DRIVE'
    };
    
    const response2 = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData2)
    });
    
    const result2 = await response2.json();
    console.log('Response 2:', result2.success ? 'SUCCESS' : 'FAILED');
    if (!result2.success) {
      console.log('Error:', result2.error);
      console.log('Details:', result2.details);
    } else {
      console.log('Created registration:', result2.data.queueNo);
      console.log('Model:', result2.data.model || 'N/A');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testNoVehicle();