// Check existing registrations to see idNumber field
import { initializeFirebase } from '../config/firebase.js';
import Registration from '../models/firebase/Registration.js';

async function checkRegistrations() {
  try {
    // Initialize Firebase first
    await initializeFirebase();
    
    console.log('Checking existing registrations...');
    
    const registrations = await Registration.getTodayRegistrations('MAIN');
    console.log(`Found ${registrations.length} registrations`);
    
    // Check first few registrations
    for (let i = 0; i < Math.min(3, registrations.length); i++) {
      const reg = registrations[i];
      console.log(`\nRegistration ${i + 1}:`);
      console.log(`  Queue: ${reg.queueNo}`);
      console.log(`  Name: ${reg.fullName}`);
      console.log(`  Mobile: ${reg.mobile}`);
      console.log(`  Email: ${reg.email || 'N/A'}`);
      console.log(`  ID Number: ${reg.idNumber || 'N/A'}`);
      console.log(`  Purpose: ${reg.purpose}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkRegistrations();