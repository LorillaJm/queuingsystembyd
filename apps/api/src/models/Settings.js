import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  // Singleton pattern - only one settings document
  _id: {
    type: String,
    default: 'app_settings'
  },
  staffPin: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 20,
    default: '1234'
  },
  allowedBranches: [{
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 10
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    prefix: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      match: /^[A-Z]+$/,
      maxlength: 5
    },
    active: {
      type: Boolean,
      default: true
    }
  }],
  dailyResetTime: {
    type: String,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    default: '00:00'
  },
  purposes: [{
    type: String,
    enum: ['TEST_DRIVE', 'SERVICE', 'INQUIRY', 'PURCHASE']
  }],
  maxQueuePerDay: {
    type: Number,
    default: 999,
    min: 1,
    max: 999
  }
}, {
  timestamps: true
});

// Static method to get settings (singleton)
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findById('app_settings');
  
  if (!settings) {
    // Create default settings
    settings = await this.create({
      _id: 'app_settings',
      staffPin: process.env.STAFF_PIN || '1234',
      allowedBranches: [
        { code: 'MAIN', name: 'Main Branch', prefix: 'A', active: true },
        { code: 'NORTH', name: 'North Branch', prefix: 'B', active: true },
        { code: 'SOUTH', name: 'South Branch', prefix: 'C', active: true }
      ],
      purposes: ['TEST_DRIVE', 'SERVICE', 'INQUIRY', 'PURCHASE'],
      dailyResetTime: '00:00',
      maxQueuePerDay: 999
    });
  }
  
  return settings;
};

// Static method to verify staff PIN
settingsSchema.statics.verifyPin = async function(pin) {
  const settings = await this.getSettings();
  return settings.staffPin === pin;
};

// Static method to get branch by code
settingsSchema.statics.getBranch = async function(branchCode) {
  const settings = await this.getSettings();
  return settings.allowedBranches.find(
    b => b.code === branchCode.toUpperCase() && b.active
  );
};

// Static method to get all active branches
settingsSchema.statics.getActiveBranches = async function() {
  const settings = await this.getSettings();
  return settings.allowedBranches.filter(b => b.active);
};

// Static method to validate branch exists
settingsSchema.statics.isBranchValid = async function(branchCode) {
  const branch = await this.getBranch(branchCode);
  return !!branch;
};

export default mongoose.model('Settings', settingsSchema);
