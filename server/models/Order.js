// ===========================================
// ORDER MODEL
// ===========================================
// This tracks every purchase a customer makes.
// It stores:
//   - WHO bought it (userId)
//   - WHAT they bought (items array)
//   - HOW MUCH they paid (totalAmount)
//   - Payment and delivery status
// ===========================================

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
    // WHY store name separately?
    // If the product name changes later, the order history should still
    // show what the customer originally bought. This is called "denormalization".
  },
  variant: {
    type: String, // e.g., "5kg"
    default: '',
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
    // WHY store price in order?
    // Same reason as name — product prices change, but the order should
    // record what the customer actually paid at that time.
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    items: [orderItemSchema],

    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: 'Gujarat' },
      pincode: { type: String, required: true },
      phone: { type: String, required: true },
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    // ---- Payment Info ----
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cod'], // COD = Cash on Delivery
      default: 'cod',
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    razorpayOrderId: {
      type: String, // Stored after Razorpay creates an order
    },

    razorpayPaymentId: {
      type: String, // Stored after successful payment
    },

    // ---- Delivery Info ----
    deliveryStatus: {
      type: String,
      enum: ['processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'processing',
    },

    deliveredAt: {
      type: Date,
    },

    // Order number for easy reference (e.g., ORD-00001)
    orderNumber: {
      type: String,
      required: true,
      unique: true
    },

    notes: {
      type: String,
      maxlength: 500,
      default: '',
    },
  },
  {
    timestamps: true, // createdAt = order date
  }
);

// ===========================================
// AUTO-GENERATE ORDER NUMBER
// ===========================================
// Creates a readable order number like "ORD-00042"
// Much easier for customers than "64a8f2b3c1d2e3f4"
// ===========================================
orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(5, '0')}`;
    // padStart(5, '0') → 1 becomes "00001", 42 becomes "00042"
  }
});

// Index for common queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ deliveryStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
