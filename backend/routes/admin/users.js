/**
 * Admin Users Routes (OWNER only)
 * GET   /api/admin/users
 * POST  /api/admin/users
 * PUT   /api/admin/users/:id
 * PATCH /api/admin/users/:id/active
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const AdminUser = require('../../models/AdminUser');
const AuditLog = require('../../models/AuditLog');
const { requireAdminAuth, requireRole } = require('../../middleware/auth');
const { ROLES } = require('../../config/constants');

// Apply admin auth + OWNER role to all routes
router.use(requireAdminAuth);
router.use(requireRole([ROLES.OWNER]));

// Validation schemas
const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(100),
  role: z.enum(['OWNER', 'MANAGER', 'STAFF'])
});

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().toLowerCase().optional(),
  password: z.string().min(8).max(100).optional(),
  role: z.enum(['OWNER', 'MANAGER', 'STAFF']).optional()
});

/**
 * GET /users
 * List all admin users
 */
router.get('/', async (req, res) => {
  try {
    const users = await AdminUser.find()
      .select('-passwordHash -refreshTokenHash')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /users
 * Create new admin user
 */
router.post('/', async (req, res) => {
  try {
    const validation = createUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validation.error.errors
      });
    }

    const { name, email, password, role } = validation.data;

    // Check if email exists
    const existing = await AdminUser.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
        code: 'EMAIL_EXISTS'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await AdminUser.create({
      name,
      email,
      passwordHash,
      role,
      active: true
    });

    // Audit log
    await AuditLog.log({
      adminUserId: req.adminId,
      action: 'ADMIN_USER_CREATE',
      entityType: 'AdminUser',
      entityId: user._id,
      after: { name, email, role },
      ipAddress: req.ip
    }).catch(() => {});

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active
      }
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * PUT /users/:id
 * Update admin user
 */
router.put('/:id', async (req, res) => {
  try {
    const validation = updateUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validation.error.errors
      });
    }

    const user = await AdminUser.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'NOT_FOUND'
      });
    }

    const { name, email, password, role } = validation.data;

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (password) {
      user.passwordHash = await bcrypt.hash(password, 12);
    }

    await user.save();

    // Audit log
    await AuditLog.log({
      adminUserId: req.adminId,
      action: 'ADMIN_USER_UPDATE',
      entityType: 'AdminUser',
      entityId: user._id,
      after: { name: user.name, email: user.email, role: user.role },
      ipAddress: req.ip
    }).catch(() => {});

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active
      }
    });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * PATCH /users/:id/active
 * Toggle admin user active status
 */
router.patch('/:id/active', async (req, res) => {
  try {
    const { active } = req.body;

    // Prevent deactivating yourself
    if (req.params.id === req.adminId.toString() && !active) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account',
        code: 'SELF_DEACTIVATE'
      });
    }

    const user = await AdminUser.findByIdAndUpdate(
      req.params.id,
      { active },
      { new: true }
    ).select('-passwordHash -refreshTokenHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'NOT_FOUND'
      });
    }

    // Audit log
    await AuditLog.log({
      adminUserId: req.adminId,
      action: active ? 'ADMIN_USER_ACTIVATE' : 'ADMIN_USER_DEACTIVATE',
      entityType: 'AdminUser',
      entityId: user._id,
      ipAddress: req.ip
    }).catch(() => {});

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Admin toggle user active error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
