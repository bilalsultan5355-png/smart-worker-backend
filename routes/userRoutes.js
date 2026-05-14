const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, customerOnly } = require('../middleware/authMiddleware');

// @desc    Get logged-in customer profile
// @route   GET /api/users/profile
// @access  Customer
router.get('/profile', protect, customerOnly, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: user });
});

// @desc    Update customer profile
// @route   PUT /api/users/profile
// @access  Customer
router.put('/profile', protect, customerOnly, async (req, res) => {
  const { name, phone, city, area, fullAddress } = req.body;

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, 'address.city': city, 'address.area': area, 'address.fullAddress': fullAddress },
    { new: true, runValidators: true }
  );

  res.json({ success: true, message: 'Profile updated', data: updated });
});

module.exports = router;
