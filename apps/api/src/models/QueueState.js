import mongoose from 'mongoose';

const queueStateSchema = new mongoose.Schema({
  branch: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    maxlength: 10
  },
  dateKey: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/,
    index: true
  },
  lastNumber: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  currentServingQueueNo: {
    type: String,
    default: null,
    match: /^[A-Z]+-\d{3}$/
  }
}, {
  timestamps: true
});

// Compound unique index to ensure one state per branch per day
queueStateSchema.index({ branch: 1, dateKey: 1 }, { unique: true });

// Static method to get or create queue state for today
queueStateSchema.statics.getOrCreateTodayState = async function(branch) {
  const dateKey = new Date().toISOString().split('T')[0];
  
  // Try to find existing state
  let state = await this.findOne({ 
    branch: branch.toUpperCase(), 
    dateKey 
  });
  
  // Create if doesn't exist
  if (!state) {
    state = await this.create({
      branch: branch.toUpperCase(),
      dateKey,
      lastNumber: 0,
      currentServingQueueNo: null
    });
  }
  
  return state;
};

// Static method to atomically increment and get next number
queueStateSchema.statics.getNextNumber = async function(branch) {
  const dateKey = new Date().toISOString().split('T')[0];
  
  // Atomic increment using findOneAndUpdate with $inc
  // This ensures no race conditions even with concurrent requests
  const state = await this.findOneAndUpdate(
    { 
      branch: branch.toUpperCase(), 
      dateKey 
    },
    { 
      $inc: { lastNumber: 1 },
      $setOnInsert: { 
        branch: branch.toUpperCase(),
        dateKey,
        currentServingQueueNo: null
      }
    },
    { 
      new: true,           // Return updated document
      upsert: true,        // Create if doesn't exist
      runValidators: true  // Run schema validators
    }
  );
  
  return state.lastNumber;
};

// Static method to update current serving
queueStateSchema.statics.updateCurrentServing = async function(branch, queueNo) {
  const dateKey = new Date().toISOString().split('T')[0];
  
  return this.findOneAndUpdate(
    { 
      branch: branch.toUpperCase(), 
      dateKey 
    },
    { 
      currentServingQueueNo: queueNo 
    },
    { 
      new: true 
    }
  );
};

// Static method to get current serving
queueStateSchema.statics.getCurrentServing = async function(branch) {
  const dateKey = new Date().toISOString().split('T')[0];
  
  const state = await this.findOne({ 
    branch: branch.toUpperCase(), 
    dateKey 
  });
  
  return state?.currentServingQueueNo || null;
};

export default mongoose.model('QueueState', queueStateSchema);
