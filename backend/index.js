// Initialize tracing FIRST before any other imports
require('./tracing');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

// Validate critical environment variables
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  } else {
    console.warn('WARNING: Running without JWT_SECRET in development mode.');
  }
}

// CORS - must be before other middleware
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
})); // Sets secure HTTP headers
app.use(mongoSanitize()); // Prevents NoSQL injection

// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500 // limit each IP to 500 requests per windowMs (increased for dev)
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 attempts per 15 min (increased for dev)
});
app.use('/api/public/auth/', authLimiter);
app.use('/api/admin/auth/', authLimiter);

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Limit payload size

// Connect to MongoDB
connectDB();

// Serve images folder statically
app.use('/images', express.static(path.join(__dirname, '..', 'images')));

// ============================================
// API Routes (New structure per Roadmap)
// ============================================

// Public API (Website + Flutter)
app.use('/api/public', require('./routes/public'));

// Admin API (Admin Panel)
app.use('/api/admin', require('./routes/admin'));

// Staff API - Reserved for future
// app.use('/api/staff', require('./routes/staff'));

// Driver API - Reserved for future
// app.use('/api/driver', require('./routes/driver'));

// ============================================
// Legacy routes (backward compatibility)
// ============================================
app.use('/api/media', require('./routes/media'));
app.use('/api/products', require('./routes/products'));
app.use('/api/premium-beans', require('./routes/premiumBeans'));
app.use('/api/categories', require('./routes/categories'));

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'SERVER_ERROR'
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
