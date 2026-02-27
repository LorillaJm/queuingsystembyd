import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { initializeFirebase } from '../config/firebase.js';
import Car from '../models/firebase/Car.js';

async function fixCarModels() {
  console.log('🔧 Fixing car models to match final list...\n');

  try {
    initializeFirebase();
    console.log('✓ Firebase connected\n');

    const branch = 'MAIN';

    // Final 8 BYD models
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

    console.log('📋 Target: 8 final car models\n');

    // Get all existing cars
    const allCars = await Car.getAllCars(branch);
    console.log(`Current cars in database: ${allCars.length}\n`);

    // Delete all existing cars
    console.log('🗑️  Deleting all existing cars...');
    for (const car of allCars) {
      await Car.delete(car.id);
      console.log(`  ✓ Deleted: ${car.model}`);
    }
    console.log('✓ All existing cars deleted\n');

    // Add final models
    console.log('➕ Adding final 8 models:\n');
    for (let i = 0; i < finalModels.length; i++) {
      const model = finalModels[i];
      const car = await Car.create({
        model,
        branch,
        isActive: true,
        displayOrder: i + 1
      });
      console.log(`  ${i + 1}. ${model} ✓`);
    }

    console.log(`\n✅ Successfully added all ${finalModels.length} BYD models!\n`);
    
    // Verify
    const verifyActiveCars = await Car.getActiveCars(branch);
    console.log(`\n🔍 Verification: ${verifyActiveCars.length} active cars in database\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fixCarModels();
