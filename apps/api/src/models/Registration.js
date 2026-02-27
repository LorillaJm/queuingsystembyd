import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  queueNo: {
    type: String,
    required: true,
    unique: true,
    match: /^[A-Z]+-\d{3}$/,
    index: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
    match: /^[0-9+\-\s()]{8,20}$/
  },
  model: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  modelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    default: null,
    index: true
  },
  branch: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    maxlength: 10
  },
  purpose: {
    type: String,
    required: true,
    enum: ['TEST_DRIVE', 'SERVICE', 'INQUIRY', 'PURCHASE'],
    default: 'TEST_DRIVE'
  },
  status: {
    type: String,
    required: true,
    enum: ['WAITING', 'SERVING', 'DONE', 'NOSHOW'],
    default: 'WAITING',
    index: true
  },
  calledAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
registrationSchema.index({ branch: 1, status: 1, createdAt: 1 });
registrationSchema.index({ branch: 1, createdAt: -1 });
registrationSchema.index({ status: 1, createdAt: 1 });

// Virtual for date key
registrationSchema.virtual('dateKey').get(function() {
  return this.createdAt.toISOString().split('T')[0];
});

// Instance method to check if registration is active
registrationSchema.methods.isActive = function() {
  return ['WAITING', 'SERVING'].includes(this.status);
};

// Static method to get queue by branch
registrationSchema.statics.getQueueByBranch = function(branch, statuses = ['WAITING', 'SERVING']) {
  return this.find({ 
    branch: branch.toUpperCase(), 
    status: { $in: statuses } 
  })
  .sort({ createdAt: 1 })
  .lean();
};

// Static method to get today's registrations
registrationSchema.statics.getTodayRegistrations = function(branch) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.find({
    branch: branch.toUpperCase(),
    createdAt: { $gte: today }
  })
  .sort({ createdAt: 1 })
  .lean();
};

export default mongoose.model('Registration', registrationSchema);
