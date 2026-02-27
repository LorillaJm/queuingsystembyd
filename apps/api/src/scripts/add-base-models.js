import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { initializeFirebase } from '../config/firebase.js';
import Car from '../models/firebase/Car.js';

async function addBaseModels() {
  console.log('🚗 Adding 8 base BYD models...\n');

  try {
    initializeFirebase();
    console.log('✓ Firebase connected\n');

    const branch = 'MAIN';

    // The 8 base models that should have asterisks
    const baseModels = [
      'BYD Atto 3',
      'BYD Dolphin',
      'BYD eMax 7',
      'BYD Shark 6',
      'BYD Seal 5',
      'BYD Sealion 5',
      'BYD Tang',
      'BYD Seagull'
    ];

    console.log('📋 Adding base models:\n');

    // Get existing cars to check for duplicates
    const existingCars = await Car.getAllCars(branch);
    
    for (const model of baseModels) {
      // Check if this exact model already exists
      const exists = existingCars.find(c => c.model === model);
      
      if (exists) {
        // Reactivate if inactive
        if (!exists.isActive) {
          await Car.update(exists.id, { isActive: true });
          console.log(`  ✓ ${model} (reactivated)`);
        } else {
          console.log(`  ✓ ${model} (already exists)`);
        }
      } else {
        // Create new model
        await Car.create({
          model,
          branch,
          isActive: true
        });
        console.log(`  ✓ ${model} (created)`);
      }
    }

    console.log(`\n✅ Successfully added/verified ${baseModels.length} base models!\n`);
    console.log('These models will now show with * in the registration dropdown.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

addBaseModels();
