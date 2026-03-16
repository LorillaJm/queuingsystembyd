import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { initializeFirebase, getDatabase } from '../config/firebase.js';
import Registration from '../models/firebase/Registration.js';
import Car from '../models/firebase/Car.js';

const salesConsultants = ['Rynel', 'Ron', 'Mary Joy', 'Meryln', 'April', 'Angelie', 'Neil', 'Jeff', 'Markboy', 'Kristian'];

const sampleCustomers = [
  { fullName: 'John Michael Lorilla', mobile: '+639171234567', email: 'john@example.com', idNumber: 'N01-123456789-1' },
  { fullName: 'Maria Santos', mobile: '+639281234567', email: 'maria@example.com', idNumber: 'N02-987654321-2' },
  { fullName: 'Pedro Cruz', mobile: '+639391234567', email: 'pedro@example.com', idNumber: 'N03-456789123-3' },
  { fullName: 'Ana Reyes', mobile: '+639401234567', email: 'ana@example.com', idNumber: 'N04-789123456-4' },
  { fullName: 'Jose Garcia', mobile: '+639511234567', email: 'jose@example.com', idNumber: 'N05-321654987-5' }
];

const purposes = [
  ['CIS'],
  ['TEST_DRIVE'],
  ['RESERVATION'],
  ['CIS', 'TEST_DRIVE'],
  ['CIS', 'TEST_DRIVE', 'RESERVATION']
];

const paymentModes = ['CASH', 'FINANCING', 'BANK_TRANSFER', 'CHECK', null];

async function seed5Registrations() {
  console.log('🌱 Seeding 5 sample registrations...\n');

  try {
    initializeFirebase();
    const db = getDatabase();
    console.log('✓ Firebase connected\n');

    const branch = 'MAIN';

    // Get available cars
    const cars = await Car.getActiveCars(branch);
    if (cars.length === 0) {
      console.error('❌ No cars available. Please run init-firebase.js first.');
      process.exit(1);
    }
    console.log(`✓ Found ${cars.length} available car models\n`);

    // Get current queue counter
    const queueStateRef = db.ref(`queueStates/${branch}`);
    const queueSnapshot = await queueStateRef.once('value');
    let currentCounter = 1;
    
    if (queueSnapshot.exists()) {
      const queueState = queueSnapshot.val();
      currentCounter = queueState.currentCounter || 1;
    }

    console.log(`Starting from queue number: ${currentCounter}\n`);
    console.log('Creating registrations...\n');

    // Create 5 registrations
    for (let i = 0; i < 5; i++) {
      const customer = sampleCustomers[i];
      const car = cars[i % cars.length]; // Cycle through available cars
      const sc = salesConsultants[i % salesConsultants.length];
      const purpose = purposes[i];
      const paymentMode = purpose.includes('RESERVATION') ? paymentModes[i % paymentModes.length] : null;

      const queueNo = currentCounter;
      
      const registration = await Registration.create({
        queueNo: queueNo.toString(),
        fullName: customer.fullName,
        mobile: customer.mobile,
        email: customer.email,
        idNumber: customer.idNumber,
        model: car.model,
        modelId: car.id,
        salesConsultant: sc,
        branch: branch,
        purpose: purpose.join(','),
        paymentMode: paymentMode,
        status: 'WAITING'
      });

      console.log(`✓ Created: Queue ${queueNo} - ${customer.fullName}`);
      console.log(`  Car: ${car.model}`);
      console.log(`  SC: ${sc}`);
      console.log(`  Purpose: ${purpose.join(', ')}`);
      if (paymentMode) console.log(`  Payment: ${paymentMode}`);
      console.log('');

      currentCounter++;
    }

    // Update queue counter
    await queueStateRef.update({
      currentCounter: currentCounter,
      lastReset: new Date().toISOString().split('T')[0]
    });

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Successfully seeded 5 registrations!');
    console.log(`✅ Next queue number will be: ${currentCounter}`);
    console.log('═══════════════════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seed5Registrations();
