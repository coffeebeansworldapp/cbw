/**
 * Admin Dashboard Routes
 * GET /api/admin/dashboard/kpis
 */

const express = require('express');
const router = express.Router();
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const Customer = require('../../models/Customer');
const { requireAdminAuth } = require('../../middleware/auth');

// Apply admin auth
router.use(requireAdminAuth);

/**
 * GET /kpis
 * Get dashboard KPIs
 */
router.get('/kpis', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    // Parallel queries for performance
    const [
      ordersToday,
      ordersTodayData,
      ordersThisWeek,
      ordersThisMonth,
      pendingOrders,
      lowStockProducts,
      totalCustomers,
      recentOrders
    ] = await Promise.all([
      // Orders count today
      Order.countDocuments({ createdAt: { $gte: today } }),
      
      // Orders data today (for revenue)
      Order.find({ createdAt: { $gte: today } }).select('pricing.grandTotal'),
      
      // Orders this week
      Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
      
      // Orders this month
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      
      // Pending orders
      Order.countDocuments({ 
        status: { $in: ['PENDING_CONFIRMATION', 'CONFIRMED', 'PREPARING'] } 
      }),
      
      // Low stock products (any variant with stockQty < 10)
      Product.find({
        active: true,
        'variants.stockQty': { $lt: 10 },
        'variants.active': true
      }).select('name variants').lean(),
      
      // Total customers
      Customer.countDocuments({ active: true }),
      
      // Recent orders
      Order.find()
        .populate('customerId', 'fullName')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('orderNo status pricing.grandTotal createdAt customerId')
        .lean()
    ]);

    // Calculate revenue
    const revenueToday = ordersTodayData.reduce(
      (sum, order) => sum + (order.pricing?.grandTotal || 0), 
      0
    );

    // Process low stock products
    const lowStock = lowStockProducts.flatMap(product => 
      product.variants
        .filter(v => v.active && v.stockQty < 10)
        .map(v => ({
          productId: product._id,
          productName: product.name,
          variant: v.label,
          sku: v.sku,
          stockQty: v.stockQty
        }))
    ).sort((a, b) => a.stockQty - b.stockQty);

    // Order status breakdown
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusBreakdown = statusCounts.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        orders: {
          today: ordersToday,
          thisWeek: ordersThisWeek,
          thisMonth: ordersThisMonth,
          pending: pendingOrders
        },
        revenue: {
          today: Math.round(revenueToday * 100) / 100
        },
        customers: {
          total: totalCustomers
        },
        inventory: {
          lowStockCount: lowStock.length,
          lowStockItems: lowStock.slice(0, 10) // Top 10 low stock
        },
        statusBreakdown,
        recentOrders: recentOrders.map(o => ({
          orderNo: o.orderNo,
          customer: o.customerId?.fullName || 'Guest',
          total: o.pricing?.grandTotal,
          status: o.status,
          createdAt: o.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Dashboard KPIs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
