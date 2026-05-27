// ===========================================
// PRODUCT MODEL
// ===========================================
// This represents each grocery item in the store.
// A product belongs to a category and can have variants
// (e.g., 1kg, 5kg, 10kg packaging).
// ===========================================

const mongoose = require('mongoose');

// Sub-schema for product variants (different sizes/packaging)
const variantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      // Examples: "500g", "1kg", "5kg", "10kg"
    },
    price: {
      type: Number,
      required: true,
    },
    wholesalePrice: {
      type: Number,
      // WHY separate wholesale price?
      // Your client has retail AND wholesale customers
      // Wholesale customers get bulk discounts
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: true } // Each variant gets its own ID (useful for cart)
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      // WHY slug? For clean URLs
      // Instead of: /product/64a8f2b3c1d2e3f4
      // We get:     /product/toor-dal-premium
    },

    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', // This links to the Category model
      required: [true, 'Product must belong to a category'],
      // WHY ObjectId ref?
      // Instead of storing category name as a string (which can have typos),
      // we store a REFERENCE (link) to the Category document.
      // This is like a "foreign key" in SQL databases.
    },

    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String }, // For cloud storage (Cloudinary) deletion later
      },
    ],

    // Base price (used when there are no variants)
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },

    wholesalePrice: {
      type: Number,
      min: [0, 'Wholesale price cannot be negative'],
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100, // Percentage
    },

    // Variants array (e.g., different sizes of the same product)
    variants: [variantSchema],

    unit: {
      type: String,
      default: 'kg',
      enum: ['kg', 'g', 'litre', 'ml', 'piece', 'dozen', 'packet'],
    },

    isActive: {
      type: Boolean,
      default: true,
      // WHY? Instead of deleting products, we can "soft delete" by setting isActive: false
      // This way, old orders still reference the product data
    },
  },
  {
    timestamps: true,
  }
);

// ===========================================
// AUTO-GENERATE SLUG BEFORE SAVING
// ===========================================
// Converts "Toor Dal Premium" → "toor-dal-premium"
productSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
      .replace(/^-+|-+$/g, '');     // Remove leading/trailing hyphens
  }
});

// Index for faster search queries
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
