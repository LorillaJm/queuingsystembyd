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

async function resetAndSeed() {
  console.log('🗑️  STEP 1: Clearing all data...\n');

  try {
    initializeFirebase();
    const db = getDatabase();
    console.log('✓ Firebase connected\n');

    const branch = 'MAIN';

    // Clear all registrations
    console.log('🔄 Clearing registrations...');
    const registrationsRef = db.ref('registrations');
    await registrationsRef.remove();
    console.log('✓ All registrations cleared\n');

    // Reset queue state
    console.log('🔄 Resetting queue state...');
    const queueStateRef = db.ref(`queueStates/${branch}`);
    await queueStateRef.set({
      currentCounter: 1,
      lastReset: new Date().toISOString().split('T')[0],
      branch
    });
    console.log('✓ Queue state reset to counter: 1\n');

    console.log('✅ Data cleared!\n');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('🌱 STEP 2: Seeding 5 registrations...\n');

    // Get available cars
    const cars = await Car.getActiveCars(branch);
    if (cars.length === 0) {
      console.error('❌ No cars available. Please run init-firebase.js first.');
      process.exit(1);
    }
    console.log(`✓ Found ${cars.length} available car models\n`);

    // Create 5 registrations
    for (let i = 0; i < 5; i++) {
      const customer = sampleCustomers[i];
      const car = cars[i % cars.length];
      const sc = salesConsultants[i % salesConsultants.length];
      const purpose = purposes[i];
      const paymentMode = purpose.includes('RESERVATION') ? paymentModes[i % paymentModes.length] : null;

      const queueNo = (i + 1).toString();
      
      await Registration.create({
        queueNo: queueNo,
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

      console.log(`✓ Queue ${queueNo}: ${customer.fullName} - ${car.model} (${purpose.join(', ')})`);
    }

    // Update queue counter
    await queueStateRef.update({ currentCounter: 6 });

    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ SUCCESS! Database reset and seeded with 5 registrations');
    console.log('✅ Next queue number will be: 6');
    console.log('═══════════════════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

resetAndSeed();
