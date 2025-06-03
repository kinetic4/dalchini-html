const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['Available', 'Unavailable', 'Busy', 'Tentative'],
    default: 'Available'
  },
  note: {
    type: String,
    default: ''
  },
  unavailableTimes: {
    type: [String],
    default: []
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add index for faster queries
calendarSchema.index({ date: 1 });

// Add method to check if date is available
calendarSchema.methods.isAvailable = function() {
  return this.status === 'Available';
};

// Add static method to find by date
calendarSchema.statics.findByDate = function(date) {
  return this.findOne({ date });
};

const Calendar = mongoose.model('Calendar', calendarSchema);

module.exports = Calendar; 