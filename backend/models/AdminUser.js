const mongoose = require('mongoose');

const ROLES = {
  OWNER: 'OWNER',       // Full access, manage admin users
  MANAGER: 'MANAGER',   // Products, orders, customers
  STAFF: 'STAFF'        // View orders, update status
};

const AdminUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true
  },
  
  passwordHash: { type: String, required: true },
  
  role: { 
    type: String, 
    required: true,
    enum: Object.values(ROLES),
    default: ROLES.STAFF
  },
  
  active: { type: Boolean, default: true },
  
  // For JWT refresh token invalidation
  refreshTokenHash: { type: String },
  
  lastLoginAt: { type: Date }

}, { timestamps: true });

// Indexes
AdminUserSchema.index({ email: 1 }, { unique: true });
AdminUserSchema.index({ role: 1 });

// Export roles enum for use in middleware
AdminUserSchema.statics.ROLES = ROLES;

module.exports = mongoose.model('AdminUser', AdminUserSchema);
