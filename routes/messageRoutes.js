const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');

// @desc    Send a message
// @route   POST /api/messages
// @access  Protected
router.post('/', protect, async (req, res) => {
  const { receiverId, receiverModel, message } = req.body;

  const senderModel = req.user.role === 'worker' ? 'Worker' : 'User';

  const newMessage = await Message.create({
    sender: req.user._id,
    senderModel,
    receiver: receiverId,
    receiverModel,
    message,
  });

  res.status(201).json({ success: true, data: newMessage });
});

// @desc    Get conversation between two users
// @route   GET /api/messages/:userId
// @access  Protected
router.get('/:userId', protect, async (req, res) => {
  const myId = req.user._id;
  const otherId = req.params.userId;

  const messages = await Message.find({
    $or: [
      { sender: myId, receiver: otherId },
      { sender: otherId, receiver: myId },
    ],
  }).sort({ createdAt: 1 });

  res.json({ success: true, data: messages });
});

module.exports = router;
