import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { initializeFirebase, getDatabase } from '../config/firebase.js';

async function seed4PerModel() {
  console.log('🌱 Seeding 4 customers per model...\n');

  try {
    initializeFirebase();
    const db = getDatabase();
    console.log('✓ Firebase connected\n');

    const branch = 'MAIN';

    // The 8 available models
    const models = [
      'BYD Atto 3',
      'BYD Dolphin', 
      'BYD eMax 7',
      'BYD Shark 6',
      'BYD Seal 5',
      'BYD Sealion 5',
      'BYD Tang',
      'BYD Seagull'
    ];

    // Sales consultants
    const salesConsultants = [
      'Rynel', 'Ron', 'Mary Joy', 'Meryln', 'April',
      'Angelie', 'Neil', 'Jeff', 'Markboy', 'Kristian'
    ];

    // Sample customer names
    const customerNames = [
      'Juan Dela Cruz', 'Maria Santos', 'Pedro Garcia', 'Ana Reyes',
      'Carlos Morales', 'Elena Torres', 'Miguel Castro', 'Rosa Fernandez',
      'Jose Martinez', 'Carmen Lopez', 'Luis Rodriguez', 'Sofia Gonzalez',
      'Diego Herrera', 'Isabella Ruiz', 'Fernando Silva', 'Valentina Moreno',
      'Gabriel Ortiz', 'Camila Jimenez', 'Ricardo Vargas', 'Lucia Mendoza',
      'Alejandro Ramos', 'Natalia Castro', 'Andres Flores', 'Daniela Guerrero',
      'Sebastian Romero', 'Adriana Medina', 'Mateo Aguilar', 'Valeria Delgado',
      'Nicolas Vega', 'Mariana Campos', 'Emilio Soto', 'Antonella Rios'
    ];

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
    
    console.log(`📊 Starting counter: ${currentCounter}`);
    console.log(`📅 Date prefix: ${datePrefix}\n`);

    let customerIndex = 0;
    let totalCreated = 0;

    // Create 4 customers for each model
    for (const model of models) {
      console.log(`🚗 Creating customers for ${model}:`);
      
      for (let i = 0; i < 4; i++) {
        const queueNo = String(currentCounter);
        const customerName = customerNames[customerIndex % customerNames.length];
        const salesConsultant = salesConsultants[Math.floor(Math.random() * salesConsultants.length)];
        const timestamp = Date.now() + totalCreated; // Ensure unique timestamps
        
        // Generate realistic mobile number
        const mobileNumber = `+639${Math.floor(Math.random() * 900000000 + 100000000)}`;
        
        // Generate email
        const email = `${customerName.toLowerCase().replace(/\s+/g, '.')}@email.com`;

        const registration = {
          queueNo,
          fullName: customerName,
          email,
          mobile: mobileNumber,
          model,
          salesConsultant,
          purpose: ['TEST_DRIVE'], // All customers want test drive
          branch,
          status: 'WAITING',
          calledAt: null,
          completedAt: null,
          createdAt: timestamp,
          updatedAt: timestamp
        };

        // Save to Firebase
        const registrationRef = db.ref('registrations').push();
        await registrationRef.set(registration);
        
        console.log(`  ✓ ${queueNo} - ${customerName} (SC: ${salesConsultant})`);
        
        currentCounter++;
        customerIndex++;
        totalCreated++;
      }
      console.log('');
    }

    // Update queue state
    await queueStateRef.set({
      currentCounter,
      lastReset: today.toISOString().split('T')[0],
      branch
    });

    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ Successfully created ${totalCreated} customers!`);
    console.log(`✅ 4 customers per model across ${models.length} models`);
    console.log(`✅ Updated counter to: ${currentCounter}`);
    console.log('═══════════════════════════════════════════════════\n');
    console.log('Queue distribution:');
    models.forEach(model => {
      console.log(`  • ${model}: 4 customers`);
    });
    console.log('\nAll customers are in WAITING status and ready to be called!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seed4PerModel();