// ===========================================
// PRODUCT CONTROLLER
// ===========================================

const Product = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

// ===========================================
// GET ALL PRODUCTS (with filtering, sorting, pagination)
// GET /api/products
// Public — anyone can browse products
// ===========================================
const getProducts = asyncHandler(async (req, res, next) => {
  // ---- Build Query ----
  const queryObj = { isActive: true }; // Only show active products

  // Filter by category
  if (req.query.category) {
    queryObj.category = req.query.category;
  }

  // Search by name
  if (req.query.search) {
    queryObj.name = { $regex: req.query.search, $options: 'i' };
    // $regex = pattern matching (like "LIKE" in SQL)
    // $options: 'i' = case insensitive ("dal" matches "Dal", "DAL", etc.)
  }

  // Price range filter
  if (req.query.minPrice || req.query.maxPrice) {
    queryObj.price = {};
    if (req.query.minPrice) queryObj.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) queryObj.price.$lte = Number(req.query.maxPrice);
  }

  // ---- Sorting ----
  // Default: newest first. Options: price_asc, price_desc, name
  let sortBy = { createdAt: -1 }; // -1 = descending (newest first)
  if (req.query.sort === 'price_asc') sortBy = { price: 1 };
  if (req.query.sort === 'price_desc') sortBy = { price: -1 };
  if (req.query.sort === 'name') sortBy = { name: 1 };

  // ---- Pagination ----
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12; // 12 products per page
  const skip = (page - 1) * limit;
  // Page 1: skip 0, get 12
  // Page 2: skip 12, get 12
  // Page 3: skip 24, get 12

  // ---- Execute Query ----
  const products = await Product.find(queryObj)
    .populate('category', 'name slug') // Replace category ID with name & slug
    .sort(sortBy)
    .skip(skip)
    .limit(limit);

  // Get total count for pagination info
  const total = await Product.countDocuments(queryObj);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    products,
  });
});

// ===========================================
// GET SINGLE PRODUCT BY SLUG
// GET /api/products/:slug
// ===========================================
const getProductBySlug = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isActive: true,
  }).populate('category', 'name slug');

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// ===========================================
// CREATE PRODUCT (Admin Only)
// POST /api/products
// ===========================================
const createProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    product,
  });
});

// ===========================================
// UPDATE PRODUCT (Admin Only)
// PUT /api/products/:id
// ===========================================
const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    product,
  });
});

// ===========================================
// DELETE PRODUCT (Soft Delete — Admin Only)
// DELETE /api/products/:id
// ===========================================
const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Soft delete: just mark as inactive
  // WHY? Hard deleting breaks existing orders that reference this product
  product.isActive = false;
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

module.exports = {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
