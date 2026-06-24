const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: [true, 'Please add a specialization'],
    trim: true
  },
  experience: {
    type: Number,
    required: [true, 'Please add experience in years']
  },
  fees: {
    type: Number,
    required: [true, 'Please add consultation fees']
  },
  availability: [
    {
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
      },
      slots: {
        type: [String], // e.g. ["09:00 AM", "10:30 AM", "02:00 PM"]
        default: []
      }
    }
  ],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    count: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  bio: {
    type: String,
    trim: true
  }
});

module.exports = mongoose.model('Doctor', DoctorSchema);
