// ===========================================
// OFFER MODEL
// ===========================================
// Special discounts that can be applied to products.
// Can target retail customers, wholesale customers, or both.
// Has an expiry date (validTill) so offers auto-expire.
// ===========================================

const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Offer title is required'],
      trim: true,
      maxlength: [100, 'Offer title cannot exceed 100 characters'],
      // Example: "Diwali Special - 20% off on all Dals"
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Offer must be linked to a product'],
    },

    discountPercent: {
      type: Number,
      required: [true, 'Discount percentage is required'],
      min: [1, 'Discount must be at least 1%'],
      max: [90, 'Discount cannot exceed 90%'],
    },

    validTill: {
      type: Date,
      required: [true, 'Offer expiry date is required'],
      // We'll check this date to see if the offer is still valid
    },

    applicableTo: {
      type: String,
      enum: ['retail', 'wholesale', 'both'],
      default: 'both',
      // WHY? Your client might want to give special discounts
      // only to wholesale buyers to encourage bulk purchasing
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

// Virtual field: Check if offer has expired
// WHY virtual? We don't store this — it's calculated on the fly
offerSchema.virtual('isExpired').get(function () {
  return new Date() > this.validTill;
});

// Include virtuals when converting to JSON
offerSchema.set('toJSON', { virtuals: true });
offerSchema.set('toObject', { virtuals: true });

// Index for quick lookups
offerSchema.index({ product: 1, isActive: 1 });
offerSchema.index({ validTill: 1 });

module.exports = mongoose.model('Offer', offerSchema);
