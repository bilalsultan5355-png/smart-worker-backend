const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    profileImage: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Service category is required'],
      enum: [
        'Plumber',
        'Electrician',
        'Carpenter',
        'Painter',
        'Mason',
        'Welder',
        'AC Technician',
        'Cleaner',
        'Gardner',
        'Other',
      ],
    },
    skills: [{ type: String }],
    experience: {
      type: Number, // years
      default: 0,
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Hourly rate is required'],
    },
    address: {
      city: { type: String, required: true },
      area: { type: String, default: '' },
      fullAddress: { type: String, default: '' },
    },
    cnicNumber: {
      type: String,
      required: [true, 'CNIC is required'],
      unique: true,
    },
    cnicImage: {
      front: { type: String, default: '' },
      back: { type: String, default: '' },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      default: 'worker',
    },
  },
  { timestamps: true }
);

// Hash password before saving
workerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
workerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Worker', workerSchema);
