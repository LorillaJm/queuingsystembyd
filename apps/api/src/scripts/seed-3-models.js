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

// Sample Filipino names
const firstNames = [
  'Maria', 'Jose', 'Juan', 'Ana', 'Pedro', 'Rosa', 'Carlos', 'Sofia',
  'Miguel', 'Isabel', 'Antonio', 'Carmen', 'Luis', 'Elena', 'Ramon',
  'Teresa', 'Fernando', 'Patricia', 'Ricardo', 'Lucia', 'Manuel', 'Gloria',
  'Roberto', 'Angelica', 'Eduardo', 'Cristina', 'Francisco', 'Beatriz',
  'Jorge', 'Margarita', 'Alberto', 'Victoria', 'Rafael', 'Diana'
];

const lastNames = [
  'Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia', 'Mendoza', 'Torres',
  'Flores', 'Rivera', 'Gomez', 'Ramos', 'Castillo', 'Morales', 'Hernandez',
  'Jimenez', 'Alvarez', 'Romero', 'Diaz', 'Vargas', 'Castro', 'Ortiz',
  'Ruiz', 'Fernandez', 'Vega', 'Lopez', 'Gonzales', 'Perez', 'Sanchez'
];

const salesConsultants = [
  'Reynel Gonzales', 'Ron Santos', 'Mary Joy Reyes', 'April Cruz',
  'Meryl Garcia', 'Angelie Mendoza', 'Karlyn Torres', 'Neil Flores',
  'Jeff Rivera', 'Mark Boy Ramos', 'Kristian Castillo'
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateFullName() {
  return `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
}

function generateMobile() {
  const prefix = '+63';
  const number = Math.floor(900000000 + Math.random() * 100000000);
  return `${prefix} ${number}`;
}

async function seedThreeModels() {
  console.log('🌱 Seeding 10 registrations for 3 specific models...\n');

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

    console.log('📋 Target models found:');
    targetCars.forEach(car => console.log(`  - ${car.model}`));
    console.log('\n');

    let totalCreated = 0;

    // Create 10 registrations for each model
    for (const car of targetCars) {
      console.log(`\n🚗 Creating 10 registrations for ${car.model}...`);
      
      for (let i = 0; i < 10; i++) {
        const queueNo = await generateQueueNumber(branch);
        const fullName = generateFullName();
        const mobile = generateMobile();
        const salesConsultant = getRandomElement(salesConsultants);

        await Registration.create({
          queueNo,
          fullName,
          mobile,
          model: car.model,
          modelId: car.id,
          salesConsultant,
          branch: branch.toUpperCase(),
          purpose: 'TEST_DRIVE',
          status: 'WAITING'
        });

        console.log(`  ${i + 1}. ${queueNo} - ${fullName} (SC: ${salesConsultant})`);
        totalCreated++;
      }
      
      console.log(`✓ Created 10 registrations for ${car.model}`);
    }

    console.log(`\n✅ Successfully created ${totalCreated} registrations!\n`);
    console.log('Summary:');
    targetCars.forEach(car => {
      console.log(`  - ${car.model}: 10 registrations`);
    });
    console.log('\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedThreeModels();
