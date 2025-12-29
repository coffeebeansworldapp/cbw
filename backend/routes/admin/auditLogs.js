/**
 * Admin Audit Logs Routes
 * GET /api/admin/audit-logs
 */

const express = require('express');
const router = express.Router();
const AuditLog = require('../../models/AuditLog');
const { requireAdminAuth, requireRole } = require('../../middleware/auth');
const { ROLES } = require('../../config/constants');

// Apply admin auth + OWNER/MANAGER role
router.use(requireAdminAuth);
router.use(requireRole([ROLES.OWNER, ROLES.MANAGER]));

/**
 * GET /audit-logs
 * List audit logs with filters
 */
router.get('/', async (req, res) => {
  try {
    const { 
      action, 
      entityType, 
      adminUserId,
      from, 
      to, 
      page = 1, 
      limit = 50 
    } = req.query;

    const filter = {};

    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;
    if (adminUserId) filter.adminUserId = adminUserId;

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('adminUserId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AuditLog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: logs,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
