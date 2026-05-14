const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
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
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
    },
  },
  { timestamps: true }
);

// Update worker rating after review
reviewSchema.post('save', async function () {
  const Worker = require('./Worker');
  const reviews = await this.constructor.find({ worker: this.worker });
  const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avgRating = totalRating / reviews.length;
  await Worker.findByIdAndUpdate(this.worker, {
    rating: avgRating.toFixed(1),
    totalReviews: reviews.length,
  });
});

module.exports = mongoose.model('Review', reviewSchema);
