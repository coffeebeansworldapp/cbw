/**
 * Public Customer Auth Routes
 * POST /api/public/auth/register
 * POST /api/public/auth/login
 * POST /api/public/auth/refresh
 * POST /api/public/auth/logout
 * GET  /api/public/me
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { z } = require('zod');
const Customer = require('../../models/Customer');
const { requireAuth, generateTokens, verifyRefreshToken } = require('../../middleware/auth');

// Validation schemas
const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(100),
  phone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string()
});

/**
 * POST /auth/register
 * Register new customer
 */
router.post('/auth/register', async (req, res) => {
  try {
    // Validate input
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validation.error.errors
      });
    }

    const { fullName, email, password, phone } = validation.data;

    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
        code: 'EMAIL_EXISTS'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create customer
    const customer = await Customer.create({
      fullName,
      email,
      passwordHash,
      phone,
      active: true
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(customer._id, 'customer');

    // Store refresh token hash
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    customer.refreshTokenHash = refreshTokenHash;
    await customer.save();

    res.status(201).json({
      success: true,
      data: {
        customer: {
          id: customer._id,
          fullName: customer.fullName,
          email: customer.email,
          phone: customer.phone
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /auth/login
 * Customer login
 */
router.post('/auth/login', async (req, res) => {
  try {
    // Validate input
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validation.error.errors
      });
    }

    const { email, password } = validation.data;

    // Find customer
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if active
    if (!customer.active) {
      return res.status(401).json({
        success: false,
        message: 'Account is disabled',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, customer.passwordHash);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(customer._id, 'customer');

    // Update refresh token and last login
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    customer.refreshTokenHash = refreshTokenHash;
    customer.lastLoginAt = new Date();
    await customer.save();

    res.json({
      success: true,
      data: {
        customer: {
          id: customer._id,
          fullName: customer.fullName,
          email: customer.email,
          phone: customer.phone,
          addresses: customer.addresses
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /auth/refresh
 * Refresh access token
 */
router.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required',
        code: 'NO_REFRESH_TOKEN'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || decoded.type !== 'customer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Find customer and verify token hash
    const customer = await Customer.findById(decoded.sub);
    if (!customer || !customer.active) {
      return res.status(401).json({
        success: false,
        message: 'Customer not found',
        code: 'CUSTOMER_NOT_FOUND'
      });
    }

    // Verify refresh token hash matches
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    if (customer.refreshTokenHash !== tokenHash) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token revoked',
        code: 'TOKEN_REVOKED'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(customer._id, 'customer');

    // Update refresh token hash
    const newRefreshTokenHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
    customer.refreshTokenHash = newRefreshTokenHash;
    await customer.save();

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /auth/logout
 * Logout customer (invalidate refresh token)
 */
router.post('/auth/logout', requireAuth, async (req, res) => {
  try {
    // Clear refresh token hash
    await Customer.findByIdAndUpdate(req.customerId, {
      $unset: { refreshTokenHash: 1 }
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /me
 * Get current customer profile
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        id: req.customer._id,
        fullName: req.customer.fullName,
        email: req.customer.email,
        phone: req.customer.phone,
        addresses: req.customer.addresses,
        emailVerified: req.customer.emailVerified,
        createdAt: req.customer.createdAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * PUT /me
 * Update customer profile
 */
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { fullName, phone } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      req.customerId,
      { fullName, phone },
      { new: true }
    ).select('-passwordHash -refreshTokenHash');

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /me/addresses
 * Add new address
 */
router.post('/me/addresses', requireAuth, async (req, res) => {
  try {
    const { label, name, phone, street, city, emirate, building, apartment, instructions, isDefault } = req.body;

    const customer = await Customer.findById(req.customerId);

    // If this is default, unset other defaults
    if (isDefault) {
      customer.addresses.forEach(addr => { addr.isDefault = false; });
    }

    customer.addresses.push({
      label: label || 'Home',
      name,
      phone,
      street,
      city,
      emirate,
      building,
      apartment,
      instructions,
      isDefault: isDefault || customer.addresses.length === 0
    });

    await customer.save();

    res.status(201).json({
      success: true,
      data: customer.addresses
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add address',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * PUT /me/addresses/:addressId
 * Update address
 */
router.put('/me/addresses/:addressId', requireAuth, async (req, res) => {
  try {
    const { addressId } = req.params;
    const customer = await Customer.findById(req.customerId);

    const address = customer.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
        code: 'NOT_FOUND'
      });
    }

    // If setting as default, unset others
    if (req.body.isDefault) {
      customer.addresses.forEach(addr => { addr.isDefault = false; });
    }

    Object.assign(address, req.body);
    await customer.save();

    res.json({
      success: true,
      data: customer.addresses
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update address',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * DELETE /me/addresses/:addressId
 * Delete address
 */
router.delete('/me/addresses/:addressId', requireAuth, async (req, res) => {
  try {
    const { addressId } = req.params;
    const customer = await Customer.findById(req.customerId);

    customer.addresses.pull(addressId);
    await customer.save();

    res.json({
      success: true,
      data: customer.addresses
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
