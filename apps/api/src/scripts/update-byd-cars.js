import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the api root directory
const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { initializeFirebase, getDatabase } from '../config/firebase.js';
import Settings from '../models/firebase/Settings.js';
import Car from '../models/firebase/Car.js';

async function updateBYDCars() {
  console.log('🚗 Updating cars to BYD models...\n');

  try {
    // Initialize Firebase
    initializeFirebase();
    console.log('✓ Firebase connected\n');

    // Get all branches
    const branches = await Settings.getActiveBranches();
    
    // BYD car models
    const bydModels = [
      { model: 'BYD Atto 3', capacity: 2, displayOrder: 1 },
      { model: 'BYD Dolphin', capacity: 2, displayOrder: 2 },
      { model: 'BYD eMax 7', capacity: 2, displayOrder: 3 },
      { model: 'BYD eMax 9 DM-i', capacity: 2, displayOrder: 4 },
      { model: 'BYD Han', capacity: 2, displayOrder: 5 },
      { model: 'BYD Seal 5', capacity: 2, displayOrder: 6 },
      { model: 'BYD Seal Performance', capacity: 2, displayOrder: 7 },
      { model: 'BYD Sealion 5 DM-i', capacity: 2, displayOrder: 8 },
      { model: 'BYD Sealion 6 DM-i', capacity: 2, displayOrder: 9 },
      { model: 'BYD Shark 6 DMO', capacity: 2, displayOrder: 10 },
      { model: 'BYD Tang EV', capacity: 2, displayOrder: 11 },
      { model: 'BYD Tang DM-i', capacity: 2, displayOrder: 12 }
    ];

    for (const branch of branches) {
      console.log(`\n📍 Branch: ${branch.name} (${branch.code})`);
      
      // Delete existing cars for this branch
      const existingCars = await Car.getAllCars(branch.code);
      console.log(`  Removing ${existingCars.length} existing cars...`);
      
      for (const car of existingCars) {
        await Car.delete(car.id);
      }
      
      // Add BYD models
      console.log(`  Adding ${bydModels.length} BYD models...`);
      for (const carData of bydModels) {
        try {
          const car = await Car.create({
            ...carData,
            branch: branch.code
          });
          console.log(`    ✓ ${car.model}`);
        } catch (error) {
          console.log(`    ✗ ${carData.model}: ${error.message}`);
        }
      }
    }

    console.log('\n✅ BYD cars updated successfully!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Update failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

updateBYDCars();
