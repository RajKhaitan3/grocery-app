// ===========================================
// AUTH CONTROLLER
// ===========================================
// Controllers contain the actual LOGIC for each route.
// Think of it like this:
//   Route = "What URL to listen to"
//   Controller = "What to DO when that URL is hit"
// ===========================================

const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../middleware/auth');

// ===========================================
// REGISTER A NEW USER
// POST /api/auth/register
// ===========================================
const register = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password, customerType } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('An account with this email already exists', 400));
  }

  // Create the user (password gets hashed automatically by the pre-save hook)
  const user = await User.create({
    name,
    email,
    phone,
    password,
    customerType: customerType || 'retail',
  });

  // Generate JWT token
  const token = generateToken(user._id);

  // Send response
  // NOTICE: We're NOT sending the password back
  res.status(201).json({
    success: true,
    message: 'Registration successful!',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      customerType: user.customerType,
      role: user.role,
    },
  });
});

// ===========================================
// LOGIN USER
// POST /api/auth/login
// ===========================================
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Find user and include password (remember, we set select: false in the model)
  // .select('+password') overrides the select: false for this query
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Invalid email or password', 401));
    // SECURITY TIP: Don't say "email not found" — that tells hackers which emails exist
  }

  // Compare passwords
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Generate token and send response
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful!',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      customerType: user.customerType,
      role: user.role,
    },
  });
});

// ===========================================
// GET CURRENT USER PROFILE
// GET /api/auth/me
// (Protected — must be logged in)
// ===========================================
const getMe = asyncHandler(async (req, res, next) => {
  // req.user is set by the protect middleware
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

// ===========================================
// UPDATE USER PROFILE
// PUT /api/auth/profile
// (Protected — must be logged in)
// ===========================================
const updateProfile = asyncHandler(async (req, res, next) => {
  // Only allow these fields to be updated
  // WHY? If we used req.body directly, someone could send { role: "admin" }
  // and make themselves an admin! This is called "Mass Assignment Attack"
  const allowedUpdates = {
    name: req.body.name,
    phone: req.body.phone,
    address: req.body.address,
  };

  // Remove undefined fields
  Object.keys(allowedUpdates).forEach(
    (key) => allowedUpdates[key] === undefined && delete allowedUpdates[key]
  );

  const user = await User.findByIdAndUpdate(req.user._id, allowedUpdates, {
    new: true, // Return the updated document
    runValidators: true, // Run schema validations on update
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user,
  });
});

module.exports = { register, login, getMe, updateProfile };
