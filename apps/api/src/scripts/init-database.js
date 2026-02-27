import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from '../models/Settings.js';
import Car from '../models/Car.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/queue-system';

async function initializeDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    console.log(`📊 Database: ${mongoose.connection.name}`);

    // 1. Initialize Settings
    console.log('\n📝 Initializing Settings...');
    const existingSettings = await Settings.findById('app_settings');
    
    if (!existingSettings) {
      await Settings.create({
        _id: 'app_settings',
        staffPin: '1234',
        allowedBranches: [
          { code: 'MAIN', name: 'Main Branch', prefix: 'A', active: true },
          { code: 'NORTH', name: 'North Branch', prefix: 'B', active: true },
          { code: 'SOUTH', name: 'South Branch', prefix: 'C', active: true }
        ],
        purposes: ['TEST_DRIVE', 'SERVICE', 'INQUIRY', 'PURCHASE'],
        dailyResetTime: '00:00',
        maxQueuePerDay: 999
      });
      console.log('✅ Settings initialized');
    } else {
      console.log('ℹ️  Settings already exist');
    }

    // 2. Add BYD Models
    console.log('\n🚗 Adding BYD Models...');
    
    const bydModels = [
      { model: 'BYD Atto 3', displayOrder: 1 },
      { model: 'BYD Dolphin', displayOrder: 2 },
      { model: 'BYD eMax 7', displayOrder: 3 },
      { model: 'BYD eMax 9 DM-i', displayOrder: 4 },
      { model: 'BYD Han', displayOrder: 5 },
      { model: 'BYD Seal 5', displayOrder: 6 },
      { model: 'BYD Seal Performance', displayOrder: 7 },
      { model: 'BYD Sealion 5 DM-i', displayOrder: 8 },
      { model: 'BYD Sealion 6 DM-i', displayOrder: 9 },
      { model: 'BYD Shark 6 DMO', displayOrder: 10 },
      { model: 'BYD Tang EV', displayOrder: 11 },
      { model: 'BYD Tang DM-i', displayOrder: 12 }
    ];

    let addedCount = 0;
    let skippedCount = 0;

    for (const modelData of bydModels) {
      const exists = await Car.findOne({
        branch: 'MAIN',
        model: modelData.model
      });

      if (!exists) {
        await Car.create({
          branch: 'MAIN',
          model: modelData.model,
          capacity: 1,
          displayOrder: modelData.displayOrder,
          isActive: true,
          imageUrl: null
        });
        console.log(`  ✅ Added: ${modelData.model}`);
        addedCount++;
      } else {
        console.log(`  ⏭️  Skipped: ${modelData.model} (already exists)`);
        skippedCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  - Added: ${addedCount} models`);
    console.log(`  - Skipped: ${skippedCount} models`);
    console.log(`  - Total: ${bydModels.length} models`);

    // 3. Display current state
    console.log('\n📋 Current Database State:');
    const allCars = await Car.find({ branch: 'MAIN' }).sort({ displayOrder: 1 });
    console.log(`\n🚗 Cars in MAIN branch (${allCars.length}):`);
    allCars.forEach(car => {
      console.log(`  ${car.displayOrder}. ${car.model} - ${car.isActive ? '✅ Active' : '❌ Inactive'}`);
    });

    const settings = await Settings.findById('app_settings');
    console.log(`\n⚙️  Settings:`);
    console.log(`  - Staff PIN: ${settings.staffPin}`);
    console.log(`  - Branches: ${settings.allowedBranches.map(b => b.name).join(', ')}`);
    console.log(`  - Max Queue/Day: ${settings.maxQueuePerDay}`);
    console.log(`  - Timezone: ${process.env.TZ || 'UTC'}`);

    console.log('\n✅ Database initialization complete!');
    console.log('\n🚀 You can now start the server with: npm run dev');
    console.log('📱 Access the app at: http://localhost:5173');
    console.log('🔐 Staff PIN: 1234');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run initialization
initializeDatabase();
