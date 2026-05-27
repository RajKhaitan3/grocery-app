// ===========================================
// JWT AUTHENTICATION MIDDLEWARE
// ===========================================
// WHAT IS JWT?
// JWT (JSON Web Token) is like a "digital ID card" for users.
// When a user logs in, we give them a token.
// For every future request, they send this token to prove they're logged in.
//
// FLOW:
// 1. User logs in → Server creates JWT → Sends it back
// 2. User makes request → Sends JWT in header → Server verifies it
// 3. If valid → Allow access. If invalid → Reject.
// ===========================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./errorHandler');
const asyncHandler = require('../utils/asyncHandler');

// ---- Protect Routes (Must be logged in) ----
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  // Format: "Bearer eyJhbGciOiJIUzI1NiIs..."
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    // split(' ') breaks "Bearer eyJ..." into ["Bearer", "eyJ..."]
    // [1] grabs the actual token
  }

  // Also check cookies (for browser-based auth)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // No token found? User is not logged in
  if (!token) {
    return next(new AppError('Please log in to access this resource', 401));
  }

  try {
    // Verify the token using our secret key
    // If someone tampered with the token, this will throw an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user from the token's ID and attach to request
    // WHY? So every controller function can access `req.user`
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new AppError('User no longer exists', 401));
    }

    next(); // User is authenticated, proceed to the next middleware/controller
  } catch (error) {
    return next(new AppError('Invalid or expired token', 401));
  }
});

// ---- Restrict to specific roles (e.g., admin only) ----
// Usage: router.get('/admin', protect, restrictTo('admin'), adminController)
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

// ---- Generate JWT Token ----
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

module.exports = { protect, restrictTo, generateToken };
