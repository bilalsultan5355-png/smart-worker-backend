const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { protect, customerOnly } = require('../middleware/authMiddleware');

// @desc    Add a review after completed booking
// @route   POST /api/reviews
// @access  Customer
router.post('/', protect, customerOnly, async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (booking.customer.toString() !== req.user._id.toString())
    return res.status(403).json({ success: false, message: 'Not authorized' });
  if (booking.status !== 'completed')
    return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
  if (booking.isReviewed)
    return res.status(400).json({ success: false, message: 'Already reviewed this booking' });

  const review = await Review.create({
    booking: bookingId,
    customer: req.user._id,
    worker: booking.worker,
    rating,
    comment,
  });

  booking.isReviewed = true;
  await booking.save();

  res.status(201).json({ success: true, message: 'Review added', data: review });
});

// @desc    Get all reviews of a worker
// @route   GET /api/reviews/worker/:workerId
// @access  Public
router.get('/worker/:workerId', async (req, res) => {
  const reviews = await Review.find({ worker: req.params.workerId })
    .populate('customer', 'name profileImage')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: reviews.length, data: reviews });
});

module.exports = router;
