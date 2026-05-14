const User = require('../models/User');
const Worker = require('../models/Worker');
const { generateToken } = require('../middleware/authMiddleware');

// @desc    Register Customer
// @route   POST /api/auth/register/customer
// @access  Public
const registerCustomer = async (req, res) => {
  const { name, email, phone, password, city } = req.body;

  const userExists = await User.findOne({ $or: [{ email }, { phone }] });
  if (userExists) {
    return res.status(400).json({ success: false, message: 'Email or phone already registered' });
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    address: { city: city || '' },
  });

  res.status(201).json({
    success: true,
    message: 'Customer registered successfully',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id, user.role),
    },
  });
};

// @desc    Register Worker
// @route   POST /api/auth/register/worker
// @access  Public
const registerWorker = async (req, res) => {
  const { name, email, phone, password, category, experience, hourlyRate, city, cnicNumber } = req.body;

  const workerExists = await Worker.findOne({ $or: [{ email }, { phone }, { cnicNumber }] });
  if (workerExists) {
    return res.status(400).json({ success: false, message: 'Email, phone or CNIC already registered' });
  }

  const worker = await Worker.create({
    name,
    email,
    phone,
    password,
    category,
    experience: experience || 0,
    hourlyRate,
    address: { city },
    cnicNumber,
  });

  res.status(201).json({
    success: true,
    message: 'Worker registered successfully. Awaiting admin verification.',
    data: {
      _id: worker._id,
      name: worker.name,
      email: worker.email,
      phone: worker.phone,
      category: worker.category,
      isVerified: worker.isVerified,
      role: worker.role,
      token: generateToken(worker._id, worker.role),
    },
  });
};

// @desc    Login Customer
// @route   POST /api/auth/login/customer
// @access  Public
const loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
  }

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      token: generateToken(user._id, user.role),
    },
  });
};

// @desc    Login Worker
// @route   POST /api/auth/login/worker
// @access  Public
const loginWorker = async (req, res) => {
  const { email, password } = req.body;

  const worker = await Worker.findOne({ email }).select('+password');
  if (!worker || !(await worker.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  if (!worker.isActive) {
    return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
  }

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      _id: worker._id,
      name: worker.name,
      email: worker.email,
      phone: worker.phone,
      category: worker.category,
      isVerified: worker.isVerified,
      role: worker.role,
      profileImage: worker.profileImage,
      token: generateToken(worker._id, worker.role),
    },
  });
};

// @desc    Admin Login
// @route   POST /api/auth/login/admin
// @access  Public
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await User.findOne({ email, role: 'admin' }).select('+password');
  if (!admin || !(await admin.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }

  res.json({
    success: true,
    message: 'Admin login successful',
    data: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id, admin.role),
    },
  });
};

module.exports = { registerCustomer, registerWorker, loginCustomer, loginWorker, loginAdmin };
