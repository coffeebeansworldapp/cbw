const mongoose = require('mongoose');

// Audit actions enum
const AUDIT_ACTIONS = {
  // Product actions
  PRODUCT_CREATE: 'PRODUCT_CREATE',
  PRODUCT_UPDATE: 'PRODUCT_UPDATE',
  PRODUCT_DELETE: 'PRODUCT_DELETE',
  PRODUCT_IMAGE_UPLOAD: 'PRODUCT_IMAGE_UPLOAD',
  PRODUCT_IMAGE_DELETE: 'PRODUCT_IMAGE_DELETE',
  PRODUCT_VARIANT_UPDATE: 'PRODUCT_VARIANT_UPDATE',
  
  // Category actions
  CATEGORY_CREATE: 'CATEGORY_CREATE',
  CATEGORY_UPDATE: 'CATEGORY_UPDATE',
  CATEGORY_DELETE: 'CATEGORY_DELETE',
  CATEGORY_REORDER: 'CATEGORY_REORDER',
  
  // Premium bean actions
  PREMIUM_BEAN_CREATE: 'PREMIUM_BEAN_CREATE',
  PREMIUM_BEAN_UPDATE: 'PREMIUM_BEAN_UPDATE',
  PREMIUM_BEAN_DELETE: 'PREMIUM_BEAN_DELETE',
  PREMIUM_BEAN_REORDER: 'PREMIUM_BEAN_REORDER',
  
  // Order actions
  ORDER_STATUS_UPDATE: 'ORDER_STATUS_UPDATE',
  ORDER_ADMIN_NOTE: 'ORDER_ADMIN_NOTE',
  ORDER_CANCEL: 'ORDER_CANCEL',
  ORDER_REFUND: 'ORDER_REFUND',
  
  // Admin user actions
  ADMIN_USER_CREATE: 'ADMIN_USER_CREATE',
  ADMIN_USER_UPDATE: 'ADMIN_USER_UPDATE',
  ADMIN_USER_DEACTIVATE: 'ADMIN_USER_DEACTIVATE',
  ADMIN_USER_ACTIVATE: 'ADMIN_USER_ACTIVATE',
  
  // Auth actions
  ADMIN_LOGIN: 'ADMIN_LOGIN',
  ADMIN_LOGOUT: 'ADMIN_LOGOUT',
  ADMIN_LOGIN_FAILED: 'ADMIN_LOGIN_FAILED'
};

// Entity types
const ENTITY_TYPES = {
  PRODUCT: 'Product',
  CATEGORY: 'Category',
  PREMIUM_BEAN: 'PremiumBean',
  ORDER: 'Order',
  CUSTOMER: 'Customer',
  ADMIN_USER: 'AdminUser'
};

const AuditLogSchema = new mongoose.Schema({
  // Who performed the action
  adminUserId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AdminUser',
    required: true
  },
  
  // What action was performed
  action: { 
    type: String, 
    required: true,
    enum: Object.values(AUDIT_ACTIONS)
  },
  
  // What entity was affected
  entityType: { 
    type: String,
    enum: Object.values(ENTITY_TYPES)
  },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  
  // Before/after snapshots for change tracking
  before: { type: mongoose.Schema.Types.Mixed },
  after: { type: mongoose.Schema.Types.Mixed },
  
  // Additional context
  description: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  
  createdAt: { type: Date, default: Date.now }

}, { 
  timestamps: false,  // Only need createdAt, not updatedAt
  capped: { size: 104857600, max: 100000 }  // 100MB cap, ~100k entries
});

// Indexes for querying
AuditLogSchema.index({ adminUserId: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ createdAt: -1 });

// Helper to create audit log entry
AuditLogSchema.statics.log = async function(data) {
  return await this.create({
    adminUserId: data.adminUserId,
    action: data.action,
    entityType: data.entityType,
    entityId: data.entityId,
    before: data.before,
    after: data.after,
    description: data.description,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent
  });
};

// Export enums
AuditLogSchema.statics.AUDIT_ACTIONS = AUDIT_ACTIONS;
AuditLogSchema.statics.ENTITY_TYPES = ENTITY_TYPES;

module.exports = mongoose.model('AuditLog', AuditLogSchema);
