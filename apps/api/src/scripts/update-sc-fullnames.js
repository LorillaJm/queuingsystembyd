import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { initializeFirebase, getDatabase } from '../config/firebase.js';

async function updateSCFullNames() {
  console.log('🔄 Updating sales consultant names to full names...\n');

  try {
    initializeFirebase();
    console.log('✓ Firebase connected\n');

    const db = getDatabase();
    const registrationsRef = db.ref('registrations');

    // Mapping of first names to full names
    const nameMapping = {
      'Reynel': 'Reynel Gonzales',
      'Ron': 'Ron Santos',
      'Mary Joy': 'Mary Joy Reyes',
      'April': 'April Cruz',
      'Meryl': 'Meryl Garcia',
      'Angelie': 'Angelie Mendoza',
      'Karlyn': 'Karlyn Torres',
      'Neil': 'Neil Flores',
      'Jeff': 'Jeff Rivera',
      'Mark Boy': 'Mark Boy Ramos',
      'Kristian': 'Kristian Castillo'
    };

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
      const oldSC = registration.salesConsultant;
      
      // Check if it needs updating (is a short name)
      if (oldSC && nameMapping[oldSC]) {
        const newSC = nameMapping[oldSC];
        
        // Add to batch update
        updates[`${id}/salesConsultant`] = newSC;
        
        console.log(`  ${registration.queueNo}: ${oldSC} → ${newSC}`);
        count++;
      }
    }

    if (count === 0) {
      console.log('✓ All sales consultant names are already full names!\n');
      process.exit(0);
    }

    console.log(`\n📝 Updating ${count} sales consultant names...`);
    
    // Apply all updates at once
    await registrationsRef.update(updates);
    
    console.log(`✅ Successfully updated ${count} sales consultant names!\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Update failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

updateSCFullNames();
