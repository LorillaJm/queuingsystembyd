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

async function startAllModels() {
  console.log('🚀 Starting service for all models...\n');

  try {
    initializeFirebase();
    const branch = 'MAIN';
    const cars = await Car.getActiveCars(branch);
    
    for (const car of cars) {
      const tickets = await Registration.getQueueByBranch(branch, ['WAITING', 'SERVING']);
      const modelTickets = tickets.filter(t => t.model === car.model);
      const waiting = modelTickets.filter(t => t.status === 'WAITING');
      const serving = modelTickets.filter(t => t.status === 'SERVING');
      
      if (serving.length === 0 && waiting.length > 0) {
        const nextTicket = waiting[0];
        await Registration.update(nextTicket.id, {
          status: 'SERVING',
          calledAt: Date.now()
        });
        console.log(`✓ ${car.model}: Called ${nextTicket.queueNo} - ${nextTicket.fullName}`);
      } else if (serving.length > 0) {
        console.log(`  ${car.model}: Already serving ${serving[0].queueNo}`);
      } else {
        console.log(`  ${car.model}: No customers waiting`);
      }
    }

    console.log('\n✅ All models started!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  }
}

startAllModels();
