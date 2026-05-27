// ===========================================
// SERVER.JS — THE MAIN ENTRY POINT
// ===========================================
// This is where your Express app starts.
// Think of it as the "main gate" of your backend.
//
// FLOW:
// 1. Load environment variables (.env)
// 2. Connect to MongoDB
// 3. Set up middleware (security, parsing, etc.)
// 4. Mount routes (tell Express which URLs to handle)
// 5. Start listening for requests
// ===========================================

// ---- Step 1: Load environment variables ----
// dotenv reads your .env file and puts values into process.env
// IMPORTANT: This MUST be the first thing that runs
const dotenv = require('dotenv');
dotenv.config();

// ---- Step 2: Import dependencies ----
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// ---- Step 3: Import routes ----
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');

// ---- Step 4: Create Express app ----
const app = express();

// ---- Step 5: Connect to MongoDB ----
connectDB();

// ===========================================
// MIDDLEWARE SETUP
// ===========================================
// Middleware = functions that run BEFORE your route handlers.
// They process the request (like a security checkpoint before entering a building).
// ===========================================

// CORS (Cross-Origin Resource Sharing)
// WHY? Your React frontend runs on port 3000 (or 5173 with Vite),
// but your backend runs on port 5000. Browsers block requests between
// different ports by default. CORS allows it.
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Parse JSON request bodies
// WHY? When React sends data (like login form), it comes as JSON.
// Without this, req.body would be undefined.
app.use(express.json({ limit: '10mb' })); // 10mb limit for image uploads

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Parse cookies from requests
app.use(cookieParser());

// ===========================================
// MOUNT ROUTES
// ===========================================
// Each route file handles a specific "area" of the API.
// The first argument is the "base URL" for that group of routes.
//
// Example:
//   authRoutes has a route '/register'
//   Mounted at '/api/auth'
//   Full URL becomes: '/api/auth/register'
//
// WHY '/api' prefix?
//   It's an industry standard to prefix API routes with '/api'
//   This separates API routes from frontend routes.
// ===========================================

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);

// ---- Health Check Route ----
// A simple route to test if the server is running
// Useful for deployment platforms like Render to check if your app is alive
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🛒 Grocery App API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ---- Handle undefined routes ----
// If someone visits a URL that doesn't exist, send a 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ---- Error handling middleware (MUST be last) ----
// WHY last? Express sends errors to the next middleware.
// If this was before our routes, errors would never reach it.
app.use(errorHandler);

// ===========================================
// START THE SERVER
// ===========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 http://localhost:${PORT}/api/health\n`);
});
