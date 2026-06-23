const mongoose = require('mongoose');

const TariffSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    enum: ['Sedan', 'MPV', 'Premium', 'Luxury', 'Tempo Traveller', 'Urbania'],
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  capacity: {
    type: String,
    required: true,
    trim: true,
  },
  capacitySeats: {
    type: Number,
    required: true,
  },
  vehicles: {
    type: [String],
    required: true,
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 0,
      message: 'At least one vehicle is required',
    },
  },
  pricing: {
    local40km: { type: Number, required: true },
    local80km: { type: Number, required: true },
    extraHour: { type: Number, required: true },
    extraKm: { type: Number, required: true },
    outstationRate: { type: Number, required: true },
    minimumDayRate: { type: Number, required: true },
    discountPrice: { type: Number, required: true },
  },
  minKmsPerDay: {
    type: Number,
    default: 300,
  },
  weddingCharge: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Tariff', TariffSchema);
