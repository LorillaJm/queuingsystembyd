// Quick test to verify ID Number is being saved properly
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testIdNumberSaving() {
  try {
    console.log('Testing ID Number saving...');
    
    // Test registration with ID Number
    const registrationData = {
      fullName: 'Test User',
      mobile: '+639123456789',
      email: 'test@example.com',
      idNumber: 'N01-12-345678',
      carId: '', // Will use model name instead
      model: 'BYD Atto 3',
      salesConsultant: 'Rynel',
      branch: 'MAIN',
      purpose: 'TEST_DRIVE'
    };
    
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registrationData)
    });
    
    const result = await response.json();
    console.log('Registration result:', result);
    
    if (result.success && result.data.idNumber) {
      console.log('✅ ID Number saved successfully:', result.data.idNumber);
    } else {
      console.log('❌ ID Number not saved properly');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testIdNumberSaving();
}