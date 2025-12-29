/**
 * Shared constants for the application
 */

// Admin roles
const ROLES = {
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF'
};

// Order status flow
const ORDER_STATUS = {
  PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
};

// Payment status
const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

// Payment methods
const PAYMENT_METHOD = {
  COD: 'COD',
  CARD: 'CARD'
};

// Fulfillment types
const FULFILLMENT_TYPE = {
  DELIVERY: 'DELIVERY',
  PICKUP: 'PICKUP'
};

// JWT config
const JWT_CONFIG = {
  ACCESS_EXPIRES: '15m',
  REFRESH_EXPIRES: '7d'
};

// Delivery fee (UAE)
const DELIVERY_FEE = 15;

// VAT rate (UAE 5%)
const VAT_RATE = 0.05;

module.exports = {
  ROLES,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  FULFILLMENT_TYPE,
  JWT_CONFIG,
  DELIVERY_FEE,
  VAT_RATE
};
