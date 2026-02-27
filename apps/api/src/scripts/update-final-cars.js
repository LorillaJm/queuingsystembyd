import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { initializeFirebase } from '../config/firebase.js';
import Car from '../models/firebase/Car.js';

async function updateFinalCars() {
  console.log('🚗 Updating to final BYD car models...\n');

  try {
    initializeFirebase();
    console.log('✓ Firebase connected\n');

    const branch = 'MAIN';

    // Final 8 BYD models for the event
    const finalModels = [
      'BYD Atto 3',
      'BYD Dolphin',
      'BYD eMax 7',
      'BYD Shark 6',
      'BYD Seal 5',
      'BYD Sealion 5',
      'BYD Tang DM-i',
      'BYD Seagull'
    ];

    console.log('📋 Final car models for February 28, 2026 event:\n');

    // Get existing cars
    const existingCars = await Car.getActiveCars(branch);
    
    // Deactivate all existing cars
    console.log('🔄 Clearing existing models...');
    for (const car of existingCars) {
      await Car.update(car.id, { isActive: false });
    }
    console.log('✓ Existing models cleared\n');

    // Add final models
    console.log('➕ Adding final models:\n');
    for (const model of finalModels) {
      const car = await Car.create({
        model,
        branch,
        isActive: true
      });
      console.log(`  ✓ ${model}`);
    }

    console.log(`\n✅ Successfully updated to ${finalModels.length} BYD models!\n`);
    console.log('🎉 Your queue system is ready for the event!\n');
    console.log('Models available:');
    finalModels.forEach((model, index) => {
      console.log(`  ${index + 1}. ${model}`);
    });
    console.log('\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Update failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

updateFinalCars();
