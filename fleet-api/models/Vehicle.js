const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true
  },
  vin: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  licensePlate: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  registrationExpiry: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'maintenance', 'retired'],
    default: 'active'
  },
  fuelType: {
    type: String,
    required: true,
    enum: ['gasoline', 'diesel', 'electric', 'hybrid'],
    default: 'gasoline'
  },
  currentMileage: {
    type: Number,
    required: true,
    default: 0
  },
  lastServiceDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Add indexes for frequently queried fields
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ vin: 1 }, { unique: true });
vehicleSchema.index({ licensePlate: 1 }, { unique: true });

module.exports = mongoose.model('Vehicle', vehicleSchema); 