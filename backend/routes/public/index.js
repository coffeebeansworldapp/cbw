/**
 * Public API Router Index
 * Mounts all public routes under /api/public
 */

const express = require('express');
const router = express.Router();

// Import route modules
const catalogRoutes = require('./catalog');
const authRoutes = require('./auth');
const orderRoutes = require('./orders');
const homeRoutes = require('./home');
const carouselRoutes = require('./carousel');
const firebaseAuthRoutes = require('./firebaseAuth');

// Mount routes
router.use('/home', homeRoutes);     // /api/public/home (aggregator)
router.use('/carousel', carouselRoutes); // /api/public/carousel
router.use('/', catalogRoutes);      // /api/public/categories, /products, /premium-beans
router.use('/', authRoutes);         // /api/public/auth/*, /me
router.use('/firebase-auth', firebaseAuthRoutes); // /api/public/firebase-auth/* (Firebase mobile auth)
router.use('/orders', orderRoutes);  // /api/public/orders

// Payment placeholder (MVP - Card coming soon)
router.post('/payments/intent', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Card payments coming soon',
    code: 'NOT_IMPLEMENTED'
  });
});

module.exports = router;
