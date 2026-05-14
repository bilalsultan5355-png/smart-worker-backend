const Booking = require('../models/Booking');
const Worker = require('../models/Worker');

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Customer
const createBooking = async (req, res) => {
  const { workerId, description, address, scheduledDate, scheduledTime, estimatedHours, paymentMethod } = req.body;

  const worker = await Worker.findById(workerId);
  if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
  if (!worker.isVerified) return res.status(400).json({ success: false, message: 'Worker is not verified yet' });
  if (!worker.isAvailable) return res.status(400).json({ success: false, message: 'Worker is not available right now' });

  const totalAmount = worker.hourlyRate * (estimatedHours || 1);

  const booking = await Booking.create({
    customer: req.user._id,
    worker: workerId,
    serviceCategory: worker.category,
    description,
    address,
    scheduledDate,
    scheduledTime,
    estimatedHours: estimatedHours || 1,
    totalAmount,
    paymentMethod: paymentMethod || 'cash',
  });

  res.status(201).json({ success: true, message: 'Booking created successfully', data: booking });
};

// @desc    Get all bookings of logged-in customer
// @route   GET /api/bookings/my
// @access  Customer
const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ customer: req.user._id })
    .populate('worker', 'name profileImage category phone rating')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: bookings.length, data: bookings });
};

// @desc    Get all bookings for logged-in worker
// @route   GET /api/bookings/worker
// @access  Worker
const getWorkerBookings = async (req, res) => {
  const bookings = await Booking.find({ worker: req.user._id })
    .populate('customer', 'name phone profileImage address')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: bookings.length, data: bookings });
};

// @desc    Accept a booking
// @route   PUT /api/bookings/:id/accept
// @access  Worker
const acceptBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (booking.worker.toString() !== req.user._id.toString())
    return res.status(403).json({ success: false, message: 'Not authorized' });

  booking.status = 'accepted';
  await booking.save();

  res.json({ success: true, message: 'Booking accepted', data: booking });
};

// @desc    Reject a booking
// @route   PUT /api/bookings/:id/reject
// @access  Worker
const rejectBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (booking.worker.toString() !== req.user._id.toString())
    return res.status(403).json({ success: false, message: 'Not authorized' });

  booking.status = 'rejected';
  booking.cancelReason = req.body.reason || '';
  await booking.save();

  res.json({ success: true, message: 'Booking rejected', data: booking });
};

// @desc    Complete a booking
// @route   PUT /api/bookings/:id/complete
// @access  Worker
const completeBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (booking.worker.toString() !== req.user._id.toString())
    return res.status(403).json({ success: false, message: 'Not authorized' });

  booking.status = 'completed';
  await booking.save();

  // Increment worker total bookings
  await Worker.findByIdAndUpdate(req.user._id, { $inc: { totalBookings: 1 } });

  res.json({ success: true, message: 'Booking marked as completed', data: booking });
};

// @desc    Cancel a booking (by customer)
// @route   PUT /api/bookings/:id/cancel
// @access  Customer
const cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (booking.customer.toString() !== req.user._id.toString())
    return res.status(403).json({ success: false, message: 'Not authorized' });

  if (['completed', 'in-progress'].includes(booking.status)) {
    return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });
  }

  booking.status = 'cancelled';
  booking.cancelReason = req.body.reason || '';
  await booking.save();

  res.json({ success: true, message: 'Booking cancelled', data: booking });
};

module.exports = {
  createBooking,
  getMyBookings,
  getWorkerBookings,
  acceptBooking,
  rejectBooking,
  completeBooking,
  cancelBooking,
};
