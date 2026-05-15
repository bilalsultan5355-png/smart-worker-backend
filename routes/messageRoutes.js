const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
});

router.get('/:userId', protect, async (req, res, next) => {
  try {
    const myId = req.user._id;
    const otherId = req.params.userId;
    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherId },
        { sender: otherId, receiver: myId },
      ],
    }).sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
});

module.exports = router;