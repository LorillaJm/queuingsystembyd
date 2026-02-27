import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { initializeFirebase } from '../config/firebase.js';
import Registration from '../models/firebase/Registration.js';
import Car from '../models/firebase/Car.js';

async function startThreeModels() {
  console.log('🚀 Starting service for 3 models...\n');

  try {
    initializeFirebase();
    console.log('✓ Firebase connected\n');

    const branch = 'MAIN';
    const targetModels = ['BYD Sealion 5', 'BYD Seagull', 'BYD Shark 6'];

    // Get all cars
    const allCars = await Car.getActiveCars(branch);
    
    // Find the target car models
    const targetCars = allCars.filter(car => targetModels.includes(car.model));
    
    if (targetCars.length !== 3) {
      console.error('❌ Could not find all 3 target models in database');
      console.log('Found models:', targetCars.map(c => c.model));
      process.exit(1);
    }

    console.log('📋 Starting service for these models:\n');

    for (const car of targetCars) {
      // Get all registrations for this branch
      const allRegistrations = await Registration.getTodayRegistrations(branch);
      
      // Find the first WAITING customer for this model
      const waitingCustomer = allRegistrations
        .filter(r => r.model === car.model && r.status === 'WAITING')
        .sort((a, b) => a.createdAt - b.createdAt)[0];

      if (waitingCustomer) {
        // Update status to SERVING
        await Registration.update(waitingCustomer.id, {
          status: 'SERVING',
          calledAt: Date.now()
        });

        console.log(`✓ ${car.model}`);
        console.log(`  Queue: ${waitingCustomer.queueNo}`);
        console.log(`  Customer: ${waitingCustomer.fullName}`);
        console.log(`  SC: ${waitingCustomer.salesConsultant || 'N/A'}\n`);
      } else {
        console.log(`⚠️  ${car.model} - No waiting customers\n`);
      }
    }

    console.log('✅ Service started for all 3 models!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to start service:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

startThreeModels();
