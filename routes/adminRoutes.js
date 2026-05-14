const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes are protected
router.use(protect, adminOnly);

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
router.get('/stats', async (req, res) => {
  const totalWorkers = await Worker.countDocuments();
  const verifiedWorkers = await Worker.countDocuments({ isVerified: true });
  const pendingWorkers = await Worker.countDocuments({ isVerified: false });
  const totalCustomers = await User.countDocuments({ role: 'customer' });
  const totalBookings = await Booking.countDocuments();
  const completedBookings = await Booking.countDocuments({ status: 'completed' });

  res.json({
    success: true,
    data: {
      totalWorkers,
      verifiedWorkers,
      pendingWorkers,
      totalCustomers,
      totalBookings,
      completedBookings,
    },
  });
});

// @desc    Get all workers (verified + unverified)
// @route   GET /api/admin/workers
router.get('/workers', async (req, res) => {
  const workers = await Worker.find().select('-password');
  res.json({ success: true, count: workers.length, data: workers });
});

// @desc    Verify a worker
// @route   PUT /api/admin/workers/:id/verify
router.put('/workers/:id/verify', async (req, res) => {
  const worker = await Worker.findByIdAndUpdate(
    req.params.id,
    { isVerified: true },
    { new: true }
  ).select('-password');

  if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
  res.json({ success: true, message: 'Worker verified successfully', data: worker });
});

// @desc    Deactivate a worker
// @route   PUT /api/admin/workers/:id/deactivate
router.put('/workers/:id/deactivate', async (req, res) => {
  const worker = await Worker.findByIdAndUpdate(
    req.params.id,
    { isActive: false, isVerified: false },
    { new: true }
  ).select('-password');

  if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
  res.json({ success: true, message: 'Worker deactivated', data: worker });
});

// @desc    Get all customers
// @route   GET /api/admin/customers
router.get('/customers', async (req, res) => {
  const customers = await User.find({ role: 'customer' });
  res.json({ success: true, count: customers.length, data: customers });
});

// @desc    Get all bookings
// @route   GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  const bookings = await Booking.find()
    .populate('customer', 'name phone')
    .populate('worker', 'name phone category')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: bookings.length, data: bookings });
});

module.exports = router;
