const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');
const { sendBookingNotification } = require('../services/whatsappService'); // Import WhatsApp service for sending booking alerts


// Generate a collision-resistant booking ID (timestamp base-36 + random suffix)
const generateBookingId = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `RT-${ts}-${rand}`;
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public
router.post('/', async (req, res) => {
  try {
    const bookingId = generateBookingId();
    const bookingData = { ...req.body, bookingId };
    
    const booking = await Booking.create(bookingData);
    
    // Populate vehicle details before returning
    const populated = await booking.populate('vehicle');
    
    // Automatically call the WhatsApp service after the booking is stored.
    // The service is invoked asynchronously, and any internal errors are logged
    // so that the client's HTTP response is not interrupted or delayed.
    sendBookingNotification(populated).catch(err => {
      console.error('[Bookings Route] Asynchronous trigger of sendBookingNotification failed:', err);
    });
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populated,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
  try {
    // Populate vehicle details
    const bookings = await Booking.find({}).populate('vehicle').sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single booking by bookingId
// @route   GET /api/bookings/:bookingId
// @access  Public
router.get('/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId }).populate('vehicle');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update a booking status/payment
// @route   PUT /api/bookings/:id
// @access  Private/Admin
router.put('/:id', protect, async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('vehicle');

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Delete/Cancel a booking
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await booking.deleteOne();
    res.json({ success: true, message: 'Booking removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
