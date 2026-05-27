// ===========================================
// CATEGORY MODEL
// ===========================================
// Categories group products together.
// Examples: "Dal & Pulses", "Rice", "Spices", "Flour", "Oil"
// Each category can have an image for the sidebar filter.
// ===========================================

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    image: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from name
categorySchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
});

module.exports = mongoose.model('Category', categorySchema);
