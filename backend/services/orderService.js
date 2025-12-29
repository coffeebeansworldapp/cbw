/**
 * Order Service
 * Handles order creation with stock validation and price calculation
 * ALL pricing is calculated server-side (Rule R3)
 */

const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { DELIVERY_FEE, VAT_RATE } = require('../config/constants');

class OrderService {
  /**
   * Create a new order
   * @param {Object} params
   * @param {string} params.customerId - Customer ID
   * @param {Array} params.items - Array of { productId, variantId, qty }
   * @param {Object} params.fulfillment - { type: 'DELIVERY'|'PICKUP', addressSnapshot?, notes? }
   * @param {Object} params.payment - { method: 'COD'|'CARD' }
   * @returns {Object} Created order
   */
  async createOrder({ customerId, items, fulfillment, payment }) {
    // Start a session for transaction
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();

      // 1. Validate and fetch products/variants
      const orderItems = [];
      let subtotal = 0;

      for (const item of items) {
        const product = await Product.findById(item.productId).session(session);
        
        if (!product || !product.active) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        // Find the variant
        const variant = product.variants.id(item.variantId);
        
        if (!variant || !variant.active) {
          throw new Error(`Variant not found: ${item.variantId}`);
        }

        // Check stock
        if (variant.stockQty < item.qty) {
          throw new Error(`Insufficient stock for ${product.name} (${variant.label}). Available: ${variant.stockQty}`);
        }

        // Calculate line total (SERVER-SIDE ONLY - Rule R3)
        const lineTotal = variant.price * item.qty;
        subtotal += lineTotal;

        // Build order item with snapshots
        orderItems.push({
          productId: product._id,
          variantId: variant._id,
          nameSnapshot: product.name,
          variantSnapshot: {
            label: variant.label,
            weightGrams: variant.weightGrams,
            sku: variant.sku
          },
          unitPrice: variant.price,
          qty: item.qty,
          lineTotal
        });

        // 2. Decrement stock
        variant.stockQty -= item.qty;
        await product.save({ session });
      }

      // 3. Calculate pricing (SERVER-SIDE ONLY - Rule R3)
      const deliveryFee = fulfillment.type === 'DELIVERY' ? DELIVERY_FEE : 0;
      const vat = Math.round((subtotal + deliveryFee) * VAT_RATE * 100) / 100;
      const grandTotal = subtotal + deliveryFee + vat;

      // 4. Generate order number
      const orderNo = await Order.generateOrderNo();

      // 5. Create order
      const order = new Order({
        orderNo,
        customerId,
        items: orderItems,
        pricing: {
          subtotal,
          discount: 0,
          deliveryFee,
          vat,
          grandTotal
        },
        payment: {
          method: payment.method,
          status: payment.method === 'COD' ? 'PENDING' : 'PENDING'
        },
        fulfillment: {
          type: fulfillment.type,
          addressSnapshot: fulfillment.addressSnapshot || null,
          notes: fulfillment.notes || ''
        },
        status: 'PENDING_CONFIRMATION',
        history: [{
          status: 'PENDING_CONFIRMATION',
          at: new Date(),
          byRole: 'CUSTOMER',
          byId: customerId,
          note: 'Order placed'
        }]
      });

      await order.save({ session });

      // Commit transaction
      await session.commitTransaction();

      return order;

    } catch (error) {
      // Rollback on error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get customer orders
   */
  async getCustomerOrders(customerId, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ customerId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ customerId })
    ]);

    return {
      orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single order for customer
   */
  async getCustomerOrder(customerId, orderId) {
    const order = await Order.findOne({
      _id: orderId,
      customerId
    }).lean();

    return order;
  }

  /**
   * Cancel order (customer initiated)
   */
  async cancelOrder(customerId, orderId) {
    const order = await Order.findOne({
      _id: orderId,
      customerId
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Only allow cancellation of pending orders
    if (!['PENDING_CONFIRMATION', 'CONFIRMED'].includes(order.status)) {
      throw new Error('Order cannot be cancelled at this stage');
    }

    // Restore stock
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.productId, 'variants._id': item.variantId },
          { $inc: { 'variants.$.stockQty': item.qty } },
          { session }
        );
      }

      // Update order status
      order.status = 'CANCELLED';
      order.addHistory('CANCELLED', 'CUSTOMER', customerId, 'Cancelled by customer');
      
      if (order.payment.status === 'PAID') {
        order.payment.status = 'REFUNDED';
      }

      await order.save({ session });
      await session.commitTransaction();

      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

module.exports = new OrderService();
