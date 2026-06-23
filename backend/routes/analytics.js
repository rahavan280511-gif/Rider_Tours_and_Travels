const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Enquiry = require('../models/Enquiry');
const { protect } = require('../middleware/auth');

// @desc    Get dashboard analytics statistics
// @route   GET /api/analytics
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
  try {
    // 1. Total Counts
    const bookingsCount = await Booking.countDocuments({});
    const vehiclesCount = await Vehicle.countDocuments({});
    const enquiriesCount = await Enquiry.countDocuments({});

    // 2. Booking Status Distribution
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'Confirmed' });
    const completedBookings = await Booking.countDocuments({ status: 'Completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'Cancelled' });

    // 3. Revenue Summaries
    // Revenue from completed or confirmed rides
    const activeBookings = await Booking.find({
      status: { $in: ['Confirmed', 'Completed'] },
    });
    const totalRevenue = activeBookings.reduce((sum, b) => sum + (b.estimatedFare || 0), 0);

    // Paid revenue
    const paidBookings = await Booking.find({ paymentStatus: 'Paid' });
    const paidRevenue = paidBookings.reduce((sum, b) => sum + (b.estimatedFare || 0), 0);

    // 4. Booking trends (last 7 days)
    const bookings = await Booking.find({}).sort({ createdAt: 1 });
    const trendData = {};
    
    // Group bookings by date (YYYY-MM-DD)
    bookings.forEach((b) => {
      if (b.createdAt) {
        const dateStr = new Date(b.createdAt).toISOString().split('T')[0];
        trendData[dateStr] = (trendData[dateStr] || 0) + 1;
      }
    });

    // 5. Popular vehicle categories
    // Aggregate category counts by populating and counting
    const populatedBookings = await Booking.find({}).populate('vehicle');
    const categoryStats = {
      Sedan: 0,
      MPV: 0,
      Premium: 0,
      Luxury: 0,
      'Tempo Traveller': 0,
      Urbania: 0,
    };

    populatedBookings.forEach((b) => {
      if (b.vehicle && b.vehicle.category) {
        categoryStats[b.vehicle.category] = (categoryStats[b.vehicle.category] || 0) + 1;
      }
    });

    res.json({
      success: true,
      stats: {
        totalRevenue,
        paidRevenue,
        bookingsCount,
        vehiclesCount,
        enquiriesCount,
        statusCounts: {
          Pending: pendingBookings,
          Confirmed: confirmedBookings,
          Completed: completedBookings,
          Cancelled: cancelledBookings,
        },
        categoryPopularity: categoryStats,
        bookingTrend: trendData,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
