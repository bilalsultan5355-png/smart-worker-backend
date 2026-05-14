const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const { protect, workerOnly } = require('../middleware/authMiddleware');

// @desc    Get all verified workers (with filters)
// @route   GET /api/workers?category=Plumber&city=Lahore
// @access  Public
router.get('/', async (req, res) => {
  const { category, city, minRating } = req.query;

  let filter = { isVerified: true, isActive: true };
  if (category) filter.category = category;
  if (city) filter['address.city'] = { $regex: city, $options: 'i' };
  if (minRating) filter.rating = { $gte: Number(minRating) };

  const workers = await Worker.find(filter).select('-password -cnicNumber -cnicImage');
  res.json({ success: true, count: workers.length, data: workers });
});

// @desc    Get single worker profile
// @route   GET /api/workers/:id
// @access  Public
router.get('/:id', async (req, res) => {
  const worker = await Worker.findById(req.params.id).select('-password -cnicNumber -cnicImage');
  if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
  res.json({ success: true, data: worker });
});

// @desc    Update worker profile
// @route   PUT /api/workers/profile
// @access  Worker
router.put('/profile', protect, workerOnly, async (req, res) => {
  const { name, phone, experience, hourlyRate, skills, city, area, isAvailable } = req.body;

  const updated = await Worker.findByIdAndUpdate(
    req.user._id,
    { name, phone, experience, hourlyRate, skills, 'address.city': city, 'address.area': area, isAvailable },
    { new: true, runValidators: true }
  ).select('-password');

  res.json({ success: true, message: 'Profile updated', data: updated });
});

// @desc    Get worker's own profile
// @route   GET /api/workers/profile/me
// @access  Worker
router.get('/profile/me', protect, workerOnly, async (req, res) => {
  const worker = await Worker.findById(req.user._id).select('-password');
  res.json({ success: true, data: worker });
});

module.exports = router;
