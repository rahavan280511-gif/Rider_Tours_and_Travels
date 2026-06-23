const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
  },
  customerName: {
    type: String,
    required: [true, 'Please add a customer name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email address'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
  },
  pickup: {
    type: String,
    required: [true, 'Please add a pickup location'],
  },
  drop: {
    type: String,
    required: [true, 'Please add a drop-off location'],
  },
  date: {
    type: String,
    required: [true, 'Please add a travel date'],
  },
  time: {
    type: String,
    required: [true, 'Please add a pickup time'],
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  tripType: {
    type: String,
    enum: ['Local', 'Outstation', 'Wedding'],
    required: true,
  },
  estimatedFare: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending',
  },
  razorpayPaymentId: {
    type: String,
    default: '',
  },
  durationHours: {
    type: Number,
  },
  kms: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Booking', BookingSchema);
