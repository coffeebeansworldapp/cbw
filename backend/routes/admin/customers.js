/**
 * Admin Customers Routes
 * GET /api/admin/customers
 * GET /api/admin/customers/:id
 */

const express = require('express');
const router = express.Router();
const Customer = require('../../models/Customer');
const Order = require('../../models/Order');
const { requireAdminAuth, requireRole } = require('../../middleware/auth');
const { ROLES } = require('../../config/constants');

// Apply admin auth
router.use(requireAdminAuth);

/**
 * GET /customers
 * List all customers
 */
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .select('-passwordHash -refreshTokenHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Customer.countDocuments(filter)
    ]);

    // Get order counts for each customer
    const customerIds = customers.map(c => c._id);
    const orderCounts = await Order.aggregate([
      { $match: { customerId: { $in: customerIds } } },
      { $group: { _id: '$customerId', count: { $sum: 1 }, totalSpent: { $sum: '$pricing.grandTotal' } } }
    ]);

    const orderCountMap = orderCounts.reduce((acc, { _id, count, totalSpent }) => {
      acc[_id.toString()] = { count, totalSpent };
      return acc;
    }, {});

    const customersWithStats = customers.map(c => ({
      ...c,
      orderCount: orderCountMap[c._id.toString()]?.count || 0,
      totalSpent: orderCountMap[c._id.toString()]?.totalSpent || 0
    }));

    res.json({
      success: true,
      data: customersWithStats,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Admin get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /customers/:id
 * Get single customer with orders
 */
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .select('-passwordHash -refreshTokenHash')
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
        code: 'NOT_FOUND'
      });
    }

    // Get customer orders
    const orders = await Order.find({ customerId: customer._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNo status pricing.grandTotal createdAt')
      .lean();

    // Calculate stats
    const stats = await Order.aggregate([
      { $match: { customerId: customer._id } },
      { $group: { 
        _id: null, 
        totalOrders: { $sum: 1 }, 
        totalSpent: { $sum: '$pricing.grandTotal' },
        avgOrderValue: { $avg: '$pricing.grandTotal' }
      }}
    ]);

    res.json({
      success: true,
      data: {
        ...customer,
        orders,
        stats: stats[0] || { totalOrders: 0, totalSpent: 0, avgOrderValue: 0 }
      }
    });
  } catch (error) {
    console.error('Admin get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
