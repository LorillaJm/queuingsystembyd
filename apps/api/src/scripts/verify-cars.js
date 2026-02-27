import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { initializeFirebase } from '../config/firebase.js';
import Car from '../models/firebase/Car.js';

async function verifyCars() {
  console.log('🔍 Verifying car models in database...\n');

  try {
    initializeFirebase();
    console.log('✓ Firebase connected\n');

    const branch = 'MAIN';

    // Get all cars (active and inactive)
    const allCars = await Car.getAllCars(branch);
    const activeCars = await Car.getActiveCars(branch);

    console.log(`📊 Total cars in database: ${allCars.length}`);
    console.log(`✅ Active cars: ${activeCars.length}\n`);

    console.log('Active car models:');
    activeCars.forEach((car, index) => {
      console.log(`  ${index + 1}. ${car.model} (ID: ${car.id})`);
    });

    if (allCars.length > activeCars.length) {
      console.log('\n⚠️  Inactive cars:');
      const inactiveCars = allCars.filter(c => !c.isActive);
      inactiveCars.forEach((car, index) => {
        console.log(`  ${index + 1}. ${car.model} (ID: ${car.id})`);
      });
    }

    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

verifyCars();
