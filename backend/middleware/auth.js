/**
 * Authentication Middleware
 * - requireAuth: Verify customer JWT
 * - requireAdminAuth: Verify admin JWT
 * - requireRole: Check admin role permissions
 */

const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const AdminUser = require('../models/AdminUser');

const JWT_SECRET = process.env.JWT_SECRET || 'cbw-secret-change-in-production';

/**
 * Verify customer authentication
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (decoded.type !== 'customer') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token type',
          code: 'INVALID_TOKEN_TYPE'
        });
      }

      const customer = await Customer.findById(decoded.sub).select('-passwordHash -refreshTokenHash');
      
      if (!customer || !customer.active) {
        return res.status(401).json({
          success: false,
          message: 'Customer not found or inactive',
          code: 'CUSTOMER_NOT_FOUND'
        });
      }

      req.customer = customer;
      req.customerId = customer._id;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Verify admin authentication
 */
const requireAdminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Admin access token required',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (decoded.type !== 'admin') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token type',
          code: 'INVALID_TOKEN_TYPE'
        });
      }

      const admin = await AdminUser.findById(decoded.sub).select('-passwordHash -refreshTokenHash');
      
      if (!admin || !admin.active) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found or inactive',
          code: 'ADMIN_NOT_FOUND'
        });
      }

      req.admin = admin;
      req.adminId = admin._id;
      req.adminRole = admin.role;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Check admin role permissions
 * @param {string[]} allowedRoles - Array of allowed roles
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.adminRole) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required',
        code: 'NO_ADMIN'
      });
    }

    if (!allowedRoles.includes(req.adminRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'FORBIDDEN'
      });
    }

    next();
  };
};

/**
 * Generate JWT tokens
 */
const generateTokens = (userId, type = 'customer') => {
  const accessToken = jwt.sign(
    { sub: userId, type },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { sub: userId, type, refresh: true },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.refresh) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
};

module.exports = {
  requireAuth,
  requireAdminAuth,
  requireRole,
  generateTokens,
  verifyRefreshToken
};
