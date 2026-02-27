import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  branch: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    maxlength: 10,
    index: true
  },
  model: {
    type: String,
    required: true,
    trim: true,
    maxlength: 60
  },
  capacity: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
    max: 10
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  displayOrder: {
    type: Number,
    default: 1,
    min: 1,
    max: 999
  },
  imageUrl: {
    type: String,
    trim: true,
    maxlength: 500,
    default: null
  }
}, {
  timestamps: true
});

// Compound unique index on branch and model
carSchema.index({ branch: 1, model: 1 }, { unique: true });

// Compound index for efficient queries
carSchema.index({ branch: 1, isActive: 1, displayOrder: 1 });

// Static method to get active cars for a branch
carSchema.statics.getActiveCars = async function(branch) {
  return this.find({
    branch: branch.toUpperCase(),
    isActive: true
  })
    .sort({ displayOrder: 1, model: 1 })
    .select('-__v')
    .lean();
};

// Static method to get all cars for a branch (including inactive)
carSchema.statics.getAllCars = async function(branch) {
  return this.find({
    branch: branch.toUpperCase()
  })
    .sort({ displayOrder: 1, model: 1 })
    .select('-__v')
    .lean();
};

// Static method to check if model exists for branch
carSchema.statics.modelExists = async function(branch, model, excludeId = null) {
  const query = {
    branch: branch.toUpperCase(),
    model: model.trim()
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const car = await this.findOne(query);
  return !!car;
};

// Instance method to toggle active status
carSchema.methods.toggleActive = async function() {
  this.isActive = !this.isActive;
  return this.save();
};

export default mongoose.model('Car', carSchema);
