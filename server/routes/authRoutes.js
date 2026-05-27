// ===========================================
// AUTH ROUTES
// ===========================================
// WHAT ARE ROUTES?
// Routes are like a "reception desk" — they receive incoming HTTP requests
// and direct them to the correct controller function.
//
// Each route has:
//   1. An HTTP METHOD (GET, POST, PUT, DELETE)
//   2. A URL PATH ('/register', '/login')
//   3. Optional MIDDLEWARE (protect, restrictTo)
//   4. A CONTROLLER function that does the actual work
// ===========================================

const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes (no login needed)
router.post('/register', register);
router.post('/login', login);

// Protected routes (must be logged in)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
