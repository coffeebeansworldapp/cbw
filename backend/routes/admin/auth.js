/**
 * Admin Auth Routes
 * POST /api/admin/auth/login
 * POST /api/admin/auth/refresh
 * POST /api/admin/auth/logout
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { z } = require('zod');
const AdminUser = require('../../models/AdminUser');
const AuditLog = require('../../models/AuditLog');
const { requireAdminAuth, generateTokens, verifyRefreshToken } = require('../../middleware/auth');

// Validation schema
const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string()
});

/**
 * POST /auth/login
 * Admin login
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

    // Find admin
    const admin = await AdminUser.findOne({ email });
    if (!admin) {
      // Log failed attempt
      await AuditLog.log({
        adminUserId: null,
        action: 'ADMIN_LOGIN_FAILED',
        description: `Failed login attempt for: ${email}`,
        ipAddress: req.ip
      }).catch(() => {}); // Don't fail on audit log error

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if active
    if (!admin.active) {
      return res.status(401).json({
        success: false,
        message: 'Account is disabled',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!validPassword) {
      await AuditLog.log({
        adminUserId: admin._id,
        action: 'ADMIN_LOGIN_FAILED',
        description: 'Invalid password',
        ipAddress: req.ip
      }).catch(() => {});

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(admin._id, 'admin');

    // Update refresh token and last login
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    admin.refreshTokenHash = refreshTokenHash;
    admin.lastLoginAt = new Date();
    await admin.save();

    // Log successful login
    await AuditLog.log({
      adminUserId: admin._id,
      action: 'ADMIN_LOGIN',
      description: 'Admin logged in successfully',
      ipAddress: req.ip
    }).catch(() => {});

    res.json({
      success: true,
      data: {
        adminId: admin._id,
        fullName: admin.name, // Model uses 'name' field
        email: admin.email,
        role: admin.role,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /auth/refresh
 * Refresh admin access token
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
    if (!decoded || decoded.type !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Find admin and verify token hash
    const admin = await AdminUser.findById(decoded.sub);
    if (!admin || !admin.active) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found',
        code: 'ADMIN_NOT_FOUND'
      });
    }

    // Verify refresh token hash matches
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    if (admin.refreshTokenHash !== tokenHash) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token revoked',
        code: 'TOKEN_REVOKED'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(admin._id, 'admin');

    // Update refresh token hash
    const newRefreshTokenHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
    admin.refreshTokenHash = newRefreshTokenHash;
    await admin.save();

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });
  } catch (error) {
    console.error('Admin refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /auth/logout
 * Logout admin
 */
router.post('/auth/logout', requireAdminAuth, async (req, res) => {
  try {
    // Clear refresh token hash
    await AdminUser.findByIdAndUpdate(req.adminId, {
      $unset: { refreshTokenHash: 1 }
    });

    // Log logout
    await AuditLog.log({
      adminUserId: req.adminId,
      action: 'ADMIN_LOGOUT',
      description: 'Admin logged out',
      ipAddress: req.ip
    }).catch(() => {});

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /me
 * Get current admin profile
 */
router.get('/me', requireAdminAuth, async (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role
    }
  });
});

module.exports = router;
