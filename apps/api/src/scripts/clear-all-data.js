import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { initializeFirebase, getDatabase } from '../config/firebase.js';

async function clearAllData() {
  console.log('🗑️  Clearing all registration data...\n');

  try {
    initializeFirebase();
    const db = getDatabase();
    console.log('✓ Firebase connected\n');

    const branch = 'MAIN';

    // Clear all registrations
    console.log('🔄 Clearing registrations...');
    const registrationsRef = db.ref('registrations');
    await registrationsRef.remove();
    console.log('✓ All registrations cleared\n');

    // Reset queue state
    console.log('🔄 Resetting queue state...');
    const queueStateRef = db.ref(`queueStates/${branch}`);
    await queueStateRef.set({
      currentCounter: 1,
      lastReset: new Date().toISOString().split('T')[0],
      branch
    });
    console.log('✓ Queue state reset to counter: 1\n');

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Successfully cleared all data!');
    console.log('✅ Queue counter reset to 1');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('The system is now clean and ready for fresh registrations.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Clear failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

clearAllData();