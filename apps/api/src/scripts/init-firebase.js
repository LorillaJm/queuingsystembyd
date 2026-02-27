import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the api root directory
const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { initializeFirebase } from '../config/firebase.js';
import Settings from '../models/firebase/Settings.js';
import Car from '../models/firebase/Car.js';

async function initializeDatabase() {
  console.log('🔥 Initializing Firebase Database...\n');

  try {
    // Initialize Firebase
    initializeFirebase();
    console.log('✓ Firebase connected\n');

    // Initialize Settings
    console.log('📝 Creating default settings...');
    const settings = await Settings.getSettings();
    console.log('✓ Settings initialized');
    console.log('  - Staff PIN:', settings.staffPin);
    console.log('  - Branches:', settings.allowedBranches.length);
    console.log('');

    // Initialize Cars for each branch
    console.log('🚗 Creating sample cars...');
    const branches = await Settings.getActiveBranches();
    
    for (const branch of branches) {
      console.log(`\n  Branch: ${branch.name} (${branch.code})`);
      
      const sampleCars = [
        { model: 'Toyota Vios', capacity: 2, displayOrder: 1 },
        { model: 'Honda City', capacity: 2, displayOrder: 2 },
        { model: 'Mitsubishi Mirage', capacity: 1, displayOrder: 3 }
      ];

      for (const carData of sampleCars) {
        try {
          const car = await Car.create({
            ...carData,
            branch: branch.code
          });
          console.log(`    ✓ ${car.model} (capacity: ${car.capacity})`);
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log(`    - ${carData.model} (already exists)`);
          } else {
            throw error;
          }
        }
      }
    }

    console.log('\n✅ Database initialization complete!\n');
    console.log('You can now start the server with: npm run dev\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Initialization failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

initializeDatabase();
