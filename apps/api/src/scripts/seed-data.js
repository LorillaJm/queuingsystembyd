import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the api root directory
const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { initializeFirebase } from '../config/firebase.js';
import Registration from '../models/firebase/Registration.js';
import Car from '../models/firebase/Car.js';
import { generateQueueNumber } from '../services/queueGenerator.js';

async function seedData() {
  console.log('🌱 Seeding sample data...\n');

  try {
    // Initialize Firebase
    initializeFirebase();
    console.log('✓ Firebase connected\n');

    // Sample customer data
    const customers = [
      { fullName: 'Juan Dela Cruz', mobile: '+639171234567', purpose: 'TEST_DRIVE' },
      { fullName: 'Maria Santos', mobile: '+639281234567', purpose: 'SERVICE' },
      { fullName: 'Pedro Reyes', mobile: '+639391234567', purpose: 'INQUIRY' },
      { fullName: 'Ana Garcia', mobile: '+639451234567', purpose: 'TEST_DRIVE' },
      { fullName: 'Jose Mendoza', mobile: '+639561234567', purpose: 'PURCHASE' },
      { fullName: 'Rosa Fernandez', mobile: '+639671234567', purpose: 'TEST_DRIVE' },
      { fullName: 'Carlos Ramos', mobile: '+639781234567', purpose: 'SERVICE' },
      { fullName: 'Elena Torres', mobile: '+639891234567', purpose: 'TEST_DRIVE' },
      { fullName: 'Miguel Castro', mobile: '+639901234567', purpose: 'INQUIRY' },
      { fullName: 'Sofia Morales', mobile: '+639121234567', purpose: 'TEST_DRIVE' }
    ];

    const branch = 'MAIN';
    
    // Get available cars for the branch
    const cars = await Car.getActiveCars(branch);
    
    if (cars.length === 0) {
      console.error('❌ No cars available for branch MAIN');
      console.log('Run: node apps/api/src/scripts/update-byd-cars.js first\n');
      process.exit(1);
    }

    console.log(`📍 Creating registrations for branch: ${branch}\n`);

    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      
      // Pick a random car
      const randomCar = cars[Math.floor(Math.random() * cars.length)];
      
      // Generate queue number
      const queueNo = await generateQueueNumber(branch);
      
      // Create registration
      const registration = await Registration.create({
        queueNo,
        fullName: customer.fullName,
        mobile: customer.mobile,
        model: randomCar.model,
        modelId: randomCar.id,
        branch: branch.toUpperCase(),
        purpose: customer.purpose,
        status: 'WAITING'
      });

      console.log(`  ✓ ${registration.queueNo} - ${registration.fullName} (${registration.model})`);
      
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n✅ Successfully seeded 10 sample registrations!\n');
    console.log('You can now:');
    console.log('  1. View them in Staff Panel: http://localhost:5173/staff');
    console.log('  2. See them in MC View: http://localhost:5173/mc?branch=MAIN');
    console.log('  3. Display on TV Screen: http://localhost:5173/screen?branch=MAIN\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedData();
