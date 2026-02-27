import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { initializeFirebase } from '../config/firebase.js';
import Car from '../models/firebase/Car.js';

async function updateAllCars() {
  console.log('🚗 Updating to complete BYD car model list...\n');

  try {
    initializeFirebase();
    console.log('✓ Firebase connected\n');

    const branch = 'MAIN';

    // Complete list of all BYD models
    // Available models will be marked with * in the frontend
    const allModels = [
      'BYD Atto 3',
      'BYD Atto 3 Premium',
      'BYD Dolphin',
      'BYD eMax 7 Standard',
      'BYD eMax 7 Superior Captain',
      'BYD eMax 9 Advance',
      'BYD eMax 9 Premium',
      'BYD Seagull',
      'BYD Seal 5 DMi Dynamic',
      'BYD Seal 5 DMi Premium',
      'BYD Seal Performance',
      'BYD Sealion 5 DMi',
      'BYD Sealion 6 DMi',
      'BYD Shark 6 Advance',
      'BYD Shark 6 Premium',
      'BYD Tang DMi',
      'BYD Tang EV'
    ];

    console.log('📋 Complete BYD car model list:\n');

    // Get existing cars
    const existingCars = await Car.getActiveCars(branch);
    const existingInactive = await Car.getAllCars(branch);
    const allExisting = [...existingCars, ...existingInactive];
    
    // Deactivate all existing cars first
    console.log('🔄 Deactivating all existing models...');
    for (const car of allExisting) {
      await Car.update(car.id, { isActive: false });
    }
    console.log('✓ All existing models deactivated\n');

    // Add all models (skip if already exists)
    console.log('➕ Adding all models:\n');
    for (const model of allModels) {
      // Check if model already exists (active or inactive)
      const existing = allExisting.find(c => c.model === model);
      
      if (existing) {
        // Reactivate existing model
        await Car.update(existing.id, { isActive: true });
        console.log(`  ✓ ${model} (reactivated)`);
      } else {
        // Create new model
        await Car.create({
          model,
          branch,
          isActive: true
        });
        console.log(`  ✓ ${model} (new)`);
      }
    }

    console.log(`\n✅ Successfully added ${allModels.length} BYD models!\n`);
    console.log('🎉 Your queue system now has the complete model list!\n');
    console.log('Available models (will show with * in dropdown):');
    console.log('  • Atto 3 (all variants)');
    console.log('  • Dolphin');
    console.log('  • eMax 7 (all variants)');
    console.log('  • Shark 6 (all variants)');
    console.log('  • Seal 5 (all variants)');
    console.log('  • Sealion 5');
    console.log('  • Tang DMi & Tang EV');
    console.log('  • Seagull\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Update failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

updateAllCars();
