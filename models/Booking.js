const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
    serviceCategory: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Please describe the work needed'],
    },
    address: {
      city: { type: String, required: true },
      area: { type: String, default: '' },
      fullAddress: { type: String, required: true },
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Please provide a scheduled date'],
    },
    scheduledTime: {
      type: String,
      required: [true, 'Please provide a scheduled time'],
    },
    estimatedHours: {
      type: Number,
      default: 1,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'jazzcash', 'easypaisa'],
      default: 'cash',
    },
    cancelReason: {
      type: String,
      default: '',
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
