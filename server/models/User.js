// ===========================================
// USER MODEL (Schema)
// ===========================================
// WHAT IS A SCHEMA?
// Think of it like a "form template" — it defines what fields
// a User document must have in MongoDB.
// MongoDB is flexible (you CAN store anything), but Mongoose
// schemas enforce structure so your data stays clean.
// ===========================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true, // Removes extra spaces: "  John  " → "John"
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true, // No two users can have the same email
      lowercase: true, // "John@Gmail.COM" → "john@gmail.com"
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },

    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
      // WHY String and not Number?
      // Phone numbers can start with 0 or +91. Numbers would strip the leading zero.
      // Also, we never do math on phone numbers, so String makes more sense.
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number'],
    },

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // IMPORTANT: This means password WON'T be returned in queries by default
      // WHY? So if someone queries all users, passwords are never accidentally exposed
    },

    customerType: {
      type: String,
      enum: ['retail', 'wholesale'], // Can ONLY be one of these two values
      default: 'retail',
    },

    address: {
      street: { type: String, default: '' },
      city: { type: String, default: 'Ahmedabad' },
      state: { type: String, default: 'Gujarat' },
      pincode: { type: String, default: '' },
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      // WHY? So we can restrict admin dashboard access later
    },
  },
  {
    // timestamps: true automatically adds "createdAt" and "updatedAt" fields
    // WHY? So we know when a user registered without manually tracking it
    timestamps: true,
  }
);

// ===========================================
// PASSWORD HASHING (Pre-save Hook)
// ===========================================
// WHAT: Before saving a user to DB, hash their password
// WHY: We NEVER store plain-text passwords. If our DB gets hacked,
//      hackers only see hashed gibberish, not real passwords.
// HOW: bcrypt converts "mypassword" → "$2a$10$X8f3..." (irreversible)
// ===========================================
userSchema.pre('save', async function () {
  // Only hash if password was modified (not on every save)
  if (!this.isModified('password')) return;

  // Salt = random data added before hashing (makes each hash unique)
  // 12 = salt rounds (higher = more secure but slower)
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ===========================================
// PASSWORD COMPARISON METHOD
// ===========================================
// WHAT: Compares the password user typed during login with the hashed one in DB
// WHY: Since we can't "un-hash" the password, we hash the input and compare
// ===========================================
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// mongoose.model('User', userSchema) creates a "users" collection in MongoDB
// (Mongoose automatically lowercases and pluralizes the name)
module.exports = mongoose.model('User', userSchema);
