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
import { generateQueueNumber } from '../services/queueGenerator.js';

async function seedPerModel() {
  console.log('🌱 Seeding 5 customers per model...\n');

  try {
    initializeFirebase();
    console.log('✓ Firebase connected\n');

    const branch = 'MAIN';
    const cars = await Car.getActiveCars(branch);
    
    if (cars.length === 0) {
      console.error('❌ No cars available');
      process.exit(1);
    }

    const firstNames = ['Juan', 'Maria', 'Pedro', 'Ana', 'Jose', 'Rosa', 'Carlos', 'Elena', 'Miguel', 'Sofia', 
                        'Luis', 'Carmen', 'Antonio', 'Isabel', 'Manuel', 'Teresa', 'Francisco', 'Patricia', 
                        'Ricardo', 'Laura', 'Roberto', 'Cristina', 'Fernando', 'Monica', 'Diego'];
    const lastNames = ['Dela Cruz', 'Santos', 'Reyes', 'Garcia', 'Mendoza', 'Fernandez', 'Ramos', 'Torres', 
                       'Castro', 'Morales', 'Rivera', 'Gomez', 'Diaz', 'Cruz', 'Hernandez', 'Lopez', 'Gonzalez'];
    const purposes = ['TEST_DRIVE', 'SERVICE', 'INQUIRY', 'PURCHASE'];

    let totalCreated = 0;

    for (const car of cars) {
      console.log(`\n📍 ${car.model}:`);
      
      for (let i = 0; i < 5; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const fullName = `${firstName} ${lastName}`;
        const mobile = `+6391${Math.floor(10000000 + Math.random() * 90000000)}`;
        const purpose = purposes[Math.floor(Math.random() * purposes.length)];
        
        const queueNo = await generateQueueNumber(branch);
        
        const registration = await Registration.create({
          queueNo,
          fullName,
          mobile,
          model: car.model,
          modelId: car.id,
          branch: branch.toUpperCase(),
          purpose,
          status: 'WAITING'
        });

        console.log(`  ✓ ${registration.queueNo} - ${registration.fullName}`);
        totalCreated++;
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`\n✅ Successfully seeded ${totalCreated} registrations (5 per model)!\n`);
    console.log('View them at: http://localhost:5173/mc?branch=MAIN\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedPerModel();
