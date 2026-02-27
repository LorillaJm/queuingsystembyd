import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the api root directory
const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { initializeFirebase, getDatabase } from '../config/firebase.js';

const sampleData = [
  {
    fullName: 'Juan Dela Cruz',
    email: 'juan.delacruz@email.com',
    mobile: '09171234567',
    idNumber: 'N01-12-345678',
    model: 'ATTO 3',
    salesConsultant: 'Maria',
    purpose: ['TEST_DRIVE'],
    remarks: 'Interested in financing options'
  },
  {
    fullName: 'Maria Garcia',
    email: 'maria.garcia@email.com',
    mobile: '09281234567',
    idNumber: 'N02-23-456789',
    model: 'DOLPHIN',
    salesConsultant: 'John',
    purpose: ['RESERVATION'],
    remarks: 'Prefers white color'
  },
  {
    fullName: 'Pedro Santos',
    email: 'pedro.santos@email.com',
    mobile: '09391234567',
    idNumber: 'N03-34-567890',
    model: 'SEAL',
    salesConsultant: 'Ana',
    purpose: ['TEST_DRIVE', 'RESERVATION'],
    remarks: 'Trade-in inquiry'
  },
  {
    fullName: 'Ana Reyes',
    email: 'ana.reyes@email.com',
    mobile: '09451234567',
    idNumber: 'N04-45-678901',
    model: 'ATTO 3',
    salesConsultant: 'Reynel',
    purpose: ['TEST_DRIVE'],
    remarks: 'First time buyer'
  },
  {
    fullName: 'Carlos Mendoza',
    email: 'carlos.mendoza@email.com',
    mobile: '09561234567',
    idNumber: 'N05-56-789012',
    model: 'DOLPHIN',
    salesConsultant: 'Ron',
    purpose: ['RESERVATION'],
    remarks: 'Corporate fleet purchase'
  }
];

async function seedSampleData() {
  try {
    console.log('🌱 Starting to seed sample data...\n');
    
    // Initialize Firebase
    initializeFirebase();
    const db = getDatabase();
    
    const branch = 'MAIN';
    
    // Get current queue state
    const queueStateRef = db.ref(`queueStates/${branch}`);
    const queueStateSnap = await queueStateRef.once('value');
    
    let currentCounter = 1;
    if (queueStateSnap.exists()) {
      const queueState = queueStateSnap.val();
      currentCounter = queueState.currentCounter || 1;
    }
    
    // Get current date for queue number prefix
    const today = new Date();
    const datePrefix = `${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    
    console.log(`📊 Current counter: ${currentCounter}`);
    console.log(`📅 Date prefix: ${datePrefix}\n`);
    
    // Create registrations
    for (let i = 0; i < sampleData.length; i++) {
      const data = sampleData[i];
      const queueNo = `${datePrefix}${String(currentCounter).padStart(4, '0')}`;
      const timestamp = Date.now() + i; // Ensure unique timestamps
      
      const registration = {
        queueNo,
        fullName: data.fullName,
        email: data.email,
        mobile: data.mobile,
        idNumber: data.idNumber,
        model: data.model,
        salesConsultant: data.salesConsultant,
        purpose: data.purpose,
        remarks: data.remarks,
        branch,
        status: 'WAITING',
        calledAt: null,
        completedAt: null,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      // Save to Firebase using push() to generate unique ID
      const registrationRef = db.ref(`registrations/${branch}`).push();
      await registrationRef.set(registration);
      
      console.log(`✓ Created: ${queueNo} - ${data.fullName}`);
      console.log(`  Email: ${data.email}`);
      console.log(`  Remarks: ${data.remarks}\n`);
      
      currentCounter++;
    }
    
    // Update queue state
    await queueStateRef.set({
      currentCounter,
      lastReset: today.toISOString().split('T')[0],
      branch
    });
    
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Successfully seeded 5 sample registrations!');
    console.log(`✅ Updated counter to: ${currentCounter}`);
    console.log('═══════════════════════════════════════════════════\n');
    console.log('Sample data includes:');
    console.log('  ✓ Full names');
    console.log('  ✓ Email addresses');
    console.log('  ✓ Mobile numbers');
    console.log('  ✓ Vehicle models');
    console.log('  ✓ Sales consultants');
    console.log('  ✓ Purpose (Test Drive/Reservation)');
    console.log('  ✓ Remarks\n');
    console.log('Access the summary page at: http://localhost:5173/summary');
    console.log('PIN: 9999\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

seedSampleData();
