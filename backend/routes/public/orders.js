/**
 * Public Order Routes
 * POST /api/public/orders
 * GET  /api/public/orders
 * GET  /api/public/orders/:id
 * POST /api/public/orders/:id/cancel
 */

const express = require('express');
const router = express.Router();
const { z } = require('zod');
const mongoose = require('mongoose');
const { requireAuth } = require('../../middleware/auth');
const orderService = require('../../services/orderService');

// Validation schema for order creation
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().refine(val => mongoose.Types.ObjectId.isValid(val), {
      message: 'Invalid product ID'
    }),
    variantId: z.string().refine(val => mongoose.Types.ObjectId.isValid(val), {
      message: 'Invalid variant ID'
    }),
    qty: z.number().int().min(1).max(99)
  })).min(1, 'At least one item required'),
  
  fulfillment: z.object({
    type: z.enum(['DELIVERY', 'PICKUP']),
    addressSnapshot: z.object({
      name: z.string(),
      phone: z.string(),
      street: z.string(),
      city: z.string(),
      emirate: z.string(),
      building: z.string().optional(),
      apartment: z.string().optional(),
      instructions: z.string().optional()
    }).optional(),
    notes: z.string().optional()
  }),
  
  payment: z.object({
    method: z.enum(['COD', 'CARD'])
  })
});

/**
 * POST /orders
 * Create new order
 * Body: { items, fulfillment, payment }
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    // Validate input
    const validation = createOrderSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validation.error.errors
      });
    }

    const { items, fulfillment, payment } = validation.data;

    // Validate delivery address required for DELIVERY
    if (fulfillment.type === 'DELIVERY' && !fulfillment.addressSnapshot) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address required for delivery orders',
        code: 'ADDRESS_REQUIRED'
      });
    }

    // MVP: Only COD supported
    if (payment.method === 'CARD') {
      return res.status(400).json({
        success: false,
        message: 'Card payment coming soon. Please use Cash on Delivery.',
        code: 'CARD_NOT_SUPPORTED'
      });
    }

    // Create order
    const order = await orderService.createOrder({
      customerId: req.customerId,
      items,
      fulfillment,
      payment
    });

    res.status(201).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Create order error:', error);
    
    // Handle specific errors
    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: 'INSUFFICIENT_STOCK'
      });
    }
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message,
        code: 'NOT_FOUND'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /orders
 * Get customer's orders
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await orderService.getCustomerOrders(req.customerId, { page, limit });

    res.json({
      success: true,
      data: result.orders,
      meta: result.meta
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /orders/:id
 * Get single order
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
        code: 'INVALID_ID'
      });
    }

    const order = await orderService.getCustomerOrder(req.customerId, id);

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
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /orders/:id/cancel
 * Cancel order
 */
router.post('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
        code: 'INVALID_ID'
      });
    }

    const order = await orderService.cancelOrder(req.customerId, id);

    res.json({
      success: true,
      data: order,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    
    if (error.message === 'Order not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
        code: 'NOT_FOUND'
      });
    }

    if (error.message.includes('cannot be cancelled')) {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: 'CANCELLATION_NOT_ALLOWED'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
