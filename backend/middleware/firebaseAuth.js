/**
 * Firebase Authentication Middleware
 * Verifies Firebase ID tokens and loads user from MongoDB
 */

const admin = require('../config/firebase');
const Customer = require('../models/Customer');

/**
 * Verify Firebase ID token and load customer
 * Creates customer record if it doesn't exist (for new Firebase users)
 */
const requireFirebaseAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('🔐 Auth request:', {
      hasAuth: !!authHeader,
      authStart: authHeader?.substring(0, 20),
      path: req.path
    });
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No token in request');
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    const idToken = authHeader.split(' ')[1];
    
    try {
      // Verify the Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log('✅ Token verified for:', decodedToken.email);
      
      const firebaseUid = decodedToken.uid;
      const email = decodedToken.email;
      const emailVerified = decodedToken.email_verified || false;
      
      // Find or create customer in MongoDB
      let customer = await Customer.findOne({ firebaseUid }).select('-passwordHash -refreshTokenHash');
      
      if (!customer && email) {
        // Auto-create customer for new Firebase users
        customer = await Customer.create({
          firebaseUid,
          email,
          fullName: decodedToken.name || email.split('@')[0],
          emailVerified,
          active: true,
          authProvider: 'firebase',
          lastLoginAt: new Date()
        });
        
        console.log(`✅ Auto-created customer for Firebase UID: ${firebaseUid}`);
      } else if (customer) {
        // Update last login
        customer.lastLoginAt = new Date();
        if (emailVerified && !customer.emailVerified) {
          customer.emailVerified = true;
        }
        await customer.save();
      }
      
      if (!customer || !customer.active) {
        return res.status(401).json({
          success: false,
          message: 'Customer not found or inactive',
          code: 'CUSTOMER_NOT_FOUND'
        });
      }
      
      // Attach Firebase and customer data to request
      req.firebaseUser = decodedToken;
      req.customer = customer;
      req.customerId = customer._id;
      
      next();
    } catch (error) {
      console.error('Firebase token verification error:', error);
      
      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({
          success: false,
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (error.code === 'auth/argument-error') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token format',
          code: 'INVALID_TOKEN'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }
  } catch (error) {
    console.error('Firebase auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

/**
 * Optional Firebase auth - doesn't fail if no token provided
 * Useful for endpoints that have different behavior for authenticated users
 */
const optionalFirebaseAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const idToken = authHeader.split(' ')[1];
    
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const customer = await Customer.findOne({ firebaseUid: decodedToken.uid })
        .select('-passwordHash -refreshTokenHash');
      
      if (customer && customer.active) {
        req.firebaseUser = decodedToken;
        req.customer = customer;
        req.customerId = customer._id;
      }
    } catch (error) {
      // Silently fail - continue as unauthenticated
      console.log('Optional auth failed:', error.message);
    }
    
    next();
  } catch (error) {
    console.error('Optional Firebase auth error:', error);
    next();
  }
};

module.exports = {
  requireFirebaseAuth,
  optionalFirebaseAuth
};
