// ===========================================
// ORDER CONTROLLER
// ===========================================

const Order = require('../models/Order');
const Product = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

// ===========================================
// CREATE NEW ORDER
// POST /api/orders
// (Protected — must be logged in)
// ===========================================
const createOrder = asyncHandler(async (req, res, next) => {
  const { items, shippingAddress, paymentMethod, notes } = req.body;

  if (!items || items.length === 0) {
    return next(new AppError('No items in order', 400));
  }

  // Calculate total and validate items against actual product prices
  // WHY? Never trust prices from the frontend!
  // A hacker could modify the price in the request to pay ₹1 for everything.
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product) {
      return next(new AppError(`Product not found: ${item.product}`, 404));
    }

    if (!product.isActive) {
      return next(new AppError(`Product ${product.name} is no longer available`, 400));
    }

    // Determine the correct price based on customer type and variant
    let itemPrice = product.price;

    // If user is wholesale and wholesale price exists, use it
    if (req.user.customerType === 'wholesale' && product.wholesalePrice) {
      itemPrice = product.wholesalePrice;
    }

    // If a variant is specified, use variant price
    if (item.variantId) {
      const variant = product.variants.id(item.variantId);
      if (variant) {
        itemPrice = req.user.customerType === 'wholesale' && variant.wholesalePrice
          ? variant.wholesalePrice
          : variant.price;
      }
    }

    // Apply product discount if any
    if (product.discount > 0) {
      itemPrice = itemPrice * (1 - product.discount / 100);
    }

    totalAmount += itemPrice * item.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      variant: item.variant || '',
      quantity: item.quantity,
      price: itemPrice,
    });
  }

  // Round to 2 decimal places
  totalAmount = Math.round(totalAmount * 100) / 100;

  // Create the order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    totalAmount,
    paymentMethod: paymentMethod || 'cod',
    notes: notes || '',
  });

  res.status(201).json({
    success: true,
    message: 'Order placed successfully!',
    order,
  });
});

// ===========================================
// GET MY ORDERS (Logged-in user's orders)
// GET /api/orders/my-orders
// ===========================================
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 }) // Newest first
    .populate('items.product', 'name images slug');

  res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
});

// ===========================================
// GET SINGLE ORDER
// GET /api/orders/:id
// ===========================================
const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('items.product', 'name images slug');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Make sure users can only see their own orders (unless admin)
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to view this order', 403));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// ===========================================
// GET ALL ORDERS (Admin Only)
// GET /api/orders
// ===========================================
const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Optional status filter
  const filter = {};
  if (req.query.deliveryStatus) filter.deliveryStatus = req.query.deliveryStatus;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

  const orders = await Order.find(filter)
    .populate('user', 'name email phone customerType')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    orders,
  });
});

// ===========================================
// UPDATE ORDER STATUS (Admin Only)
// PUT /api/orders/:id/status
// ===========================================
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (req.body.deliveryStatus) {
    order.deliveryStatus = req.body.deliveryStatus;

    // Auto-set deliveredAt when marked as delivered
    if (req.body.deliveryStatus === 'delivered') {
      order.deliveredAt = new Date();
    }
  }

  if (req.body.paymentStatus) {
    order.paymentStatus = req.body.paymentStatus;
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order status updated',
    order,
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
};
