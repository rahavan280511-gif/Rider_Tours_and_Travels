const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a vehicle name'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: ['Sedan', 'MPV', 'Premium', 'Luxury', 'Tempo Traveller', 'Urbania'],
  },
  capacity: {
    type: Number,
    required: [true, 'Please specify vehicle capacity (seating count)'],
  },
  features: {
    type: [String],
    default: ['AC', 'Music System', 'GPS Enabled', 'Clean Seats'],
  },
  pricing: {
    hrs4_kms40: {
      type: Number,
      required: true,
    },
    hrs8_kms80: {
      type: Number,
      required: true,
    },
    extraHr: {
      type: Number,
      required: true,
    },
    extraKm: {
      type: Number,
      required: true,
    },
    outstationRate: {
      type: Number,
      required: true,
    },
    minKmsDay: {
      type: Number,
      default: 300,
    },
    discountedPrice: {
      type: Number,
      required: true,
    },
  },
  imageUrl: {
    type: String,
    required: true,
  },
  available: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
