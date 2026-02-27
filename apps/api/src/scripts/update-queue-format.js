import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { initializeFirebase, getDatabase } from '../config/firebase.js';

async function updateQueueFormat() {
  console.log('🔄 Updating queue number format (removing A- prefix)...\n');

  try {
    initializeFirebase();
    console.log('✓ Firebase connected\n');

    const db = getDatabase();
    const registrationsRef = db.ref('registrations');

    // Get all registrations
    const snapshot = await registrationsRef.once('value');
    
    if (!snapshot.exists()) {
      console.log('No registrations found.');
      process.exit(0);
    }

    const registrations = snapshot.val();
    const updates = {};
    let count = 0;

    console.log('Processing registrations...\n');

    for (const [id, registration] of Object.entries(registrations)) {
      const oldQueueNo = registration.queueNo;
      
      // Check if it has the old format (A-XXX)
      if (oldQueueNo && oldQueueNo.includes('-')) {
        // Extract just the number part
        const numberPart = oldQueueNo.split('-')[1];
        const newQueueNo = numberPart;
        
        // Add to batch update
        updates[`${id}/queueNo`] = newQueueNo;
        
        console.log(`  ${oldQueueNo} → ${newQueueNo}`);
        count++;
      }
    }

    if (count === 0) {
      console.log('✓ All queue numbers are already in the new format!\n');
      process.exit(0);
    }

    console.log(`\n📝 Updating ${count} queue numbers...`);
    
    // Apply all updates at once
    await registrationsRef.update(updates);
    
    console.log(`✅ Successfully updated ${count} queue numbers!\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Update failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

updateQueueFormat();
