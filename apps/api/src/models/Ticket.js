import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^[A-Z]-\d{3}$/
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: /^[0-9+\-\s()]+$/
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  status: {
    type: String,
    enum: ['waiting', 'called', 'serving', 'done', 'no-show'],
    default: 'waiting'
  },
  calledAt: Date,
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

ticketSchema.index({ status: 1, createdAt: 1 });

export default mongoose.model('Ticket', ticketSchema);
