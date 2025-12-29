/**
 * Admin Orders Routes
 * GET   /api/admin/orders
 * GET   /api/admin/orders/:id
 * PATCH /api/admin/orders/:id/status
 * PATCH /api/admin/orders/:id/admin-notes
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { z } = require('zod');
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const AuditLog = require('../../models/AuditLog');
const { requireAdminAuth, requireRole } = require('../../middleware/auth');
const { ROLES, ORDER_STATUS } = require('../../config/constants');

// Apply admin auth to all routes
router.use(requireAdminAuth);

// Validation schemas
const updateStatusSchema = z.object({
  status: z.enum([
    'PENDING_CONFIRMATION',
    'CONFIRMED',
    'PREPARING',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED'
  ]),
  note: z.string().optional()
});

/**
 * GET /orders
 * List all orders with filters
 */
router.get('/', async (req, res) => {
  try {
    const { 
      status, 
      search, 
      from, 
      to, 
      page = 1, 
      limit = 20 
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { orderNo: { $regex: search, $options: 'i' } },
        { 'items.nameSnapshot': { $regex: search, $options: 'i' } }
      ];
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customerId', 'fullName email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: orders,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /orders/:id
 * Get single order with full details
 */
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'fullName email phone addresses')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Admin get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * PATCH /orders/:id/status
 * Update order status
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const validation = updateStatusSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validation.error.errors
      });
    }

    const { status, note } = validation.data;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        code: 'NOT_FOUND'
      });
    }

    const previousStatus = order.status;

    // Handle stock restoration on cancellation/refund
    if (['CANCELLED', 'REFUNDED'].includes(status) && 
        !['CANCELLED', 'REFUNDED'].includes(previousStatus)) {
      // Restore stock
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.productId, 'variants._id': item.variantId },
          { $inc: { 'variants.$.stockQty': item.qty } }
        );
      }

      // Update payment status if refunding
      if (status === 'REFUNDED' && order.payment.status === 'PAID') {
        order.payment.status = 'REFUNDED';
      }
    }

    // Update status
    order.status = status;
    order.addHistory(status, req.adminRole, req.adminId, note || `Status changed from ${previousStatus}`);

    await order.save();

    // Audit log
    await AuditLog.log({
      adminUserId: req.adminId,
      action: 'ORDER_STATUS_UPDATE',
      entityType: 'Order',
      entityId: order._id,
      before: { status: previousStatus },
      after: { status },
      description: note,
      ipAddress: req.ip
    }).catch(() => {});

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Admin update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * PATCH /orders/:id/admin-notes
 * Update admin notes on order
 */
router.patch('/:id/admin-notes', async (req, res) => {
  try {
    const { adminNotes } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { adminNotes },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        code: 'NOT_FOUND'
      });
    }

    // Audit log
    await AuditLog.log({
      adminUserId: req.adminId,
      action: 'ORDER_ADMIN_NOTE',
      entityType: 'Order',
      entityId: order._id,
      after: { adminNotes },
      ipAddress: req.ip
    }).catch(() => {});

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Admin update order notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order notes',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
