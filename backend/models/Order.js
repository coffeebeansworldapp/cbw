const mongoose = require('mongoose');

// Order status enum
const ORDER_STATUS = {
  PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
};

// Payment status enum
const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

// Payment method enum
const PAYMENT_METHOD = {
  COD: 'COD',
  CARD: 'CARD'
};

// Fulfillment type enum
const FULFILLMENT_TYPE = {
  DELIVERY: 'DELIVERY',
  PICKUP: 'PICKUP'
};

// Order item schema (with snapshots)
const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  
  // Snapshot at purchase time (prices may change later)
  nameSnapshot: { type: String, required: true },
  variantSnapshot: {
    label: { type: String, required: true },      // "250g"
    weightGrams: { type: Number, required: true }, // 250
    sku: { type: String, required: true }
  },
  
  unitPrice: { type: Number, required: true },    // Price per unit at purchase
  qty: { type: Number, required: true, min: 1 },
  lineTotal: { type: Number, required: true }     // unitPrice * qty
}, { _id: true });

// Order history entry
const HistoryEntrySchema = new mongoose.Schema({
  status: { type: String, required: true },
  at: { type: Date, default: Date.now },
  byRole: { type: String },                       // 'CUSTOMER', 'OWNER', 'MANAGER', 'STAFF', 'SYSTEM'
  byId: { type: mongoose.Schema.Types.ObjectId },
  note: { type: String }
}, { _id: true });

const OrderSchema = new mongoose.Schema({
  // Unique order number: CBW-YYYY-######
  orderNo: { type: String, required: true, unique: true },
  
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  
  items: [OrderItemSchema],
  
  // Pricing breakdown (calculated by server)
  pricing: {
    subtotal: { type: Number, required: true },     // Sum of line totals
    discount: { type: Number, default: 0 },         // Coupon/promo discount
    deliveryFee: { type: Number, default: 0 },
    vat: { type: Number, default: 0 },              // 5% VAT if applicable
    grandTotal: { type: Number, required: true }
  },
  
  // Payment info
  payment: {
    method: { 
      type: String, 
      enum: Object.values(PAYMENT_METHOD),
      required: true 
    },
    status: { 
      type: String, 
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING
    },
    provider: { type: String },                     // Future: Stripe, etc.
    transactionId: { type: String }
  },
  
  // Fulfillment info
  fulfillment: {
    type: { 
      type: String, 
      enum: Object.values(FULFILLMENT_TYPE),
      required: true 
    },
    addressSnapshot: {
      name: String,
      phone: String,
      street: String,
      city: String,
      emirate: String,
      building: String,
      apartment: String,
      instructions: String
    },
    notes: { type: String }                         // Customer notes
  },
  
  // Order status
  status: { 
    type: String, 
    enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.PENDING_CONFIRMATION
  },
  
  // Admin internal notes
  adminNotes: { type: String },
  
  // Status change history
  history: [HistoryEntrySchema]

}, { timestamps: true });

// Indexes
OrderSchema.index({ orderNo: 1 }, { unique: true });
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'payment.status': 1 });

// Generate order number: CBW-2025-000001
OrderSchema.statics.generateOrderNo = async function() {
  const year = new Date().getFullYear();
  const prefix = `CBW-${year}-`;
  
  // Find the last order of this year
  const lastOrder = await this.findOne({ 
    orderNo: new RegExp(`^${prefix}`) 
  }).sort({ orderNo: -1 });
  
  let nextNum = 1;
  if (lastOrder) {
    const lastNum = parseInt(lastOrder.orderNo.split('-')[2], 10);
    nextNum = lastNum + 1;
  }
  
  return `${prefix}${String(nextNum).padStart(6, '0')}`;
};

// Add history entry helper
OrderSchema.methods.addHistory = function(status, byRole, byId, note) {
  this.history.push({
    status,
    at: new Date(),
    byRole,
    byId,
    note
  });
};

// Export enums for use elsewhere
OrderSchema.statics.ORDER_STATUS = ORDER_STATUS;
OrderSchema.statics.PAYMENT_STATUS = PAYMENT_STATUS;
OrderSchema.statics.PAYMENT_METHOD = PAYMENT_METHOD;
OrderSchema.statics.FULFILLMENT_TYPE = FULFILLMENT_TYPE;

module.exports = mongoose.model('Order', OrderSchema);
