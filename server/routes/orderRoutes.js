// ===========================================
// ORDER ROUTES
// ===========================================

const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');

// All order routes require authentication
router.use(protect); // This applies protect middleware to ALL routes below

// Customer routes
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrder);

// Admin-only routes
router.get('/', restrictTo('admin'), getAllOrders);
router.put('/:id/status', restrictTo('admin'), updateOrderStatus);

module.exports = router;
