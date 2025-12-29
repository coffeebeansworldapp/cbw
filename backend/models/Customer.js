const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },        // "Home", "Work", "Other"
  name: { type: String, required: true },          // Recipient name
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  emirate: { type: String, required: true },       // Dubai, Abu Dhabi, etc.
  building: { type: String },
  apartment: { type: String },
  instructions: { type: String },                  // Delivery instructions
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const CustomerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true
  },
  
  // Firebase Authentication UID (optional - for Firebase auth users)
  firebaseUid: { 
    type: String, 
    unique: true, 
    sparse: true  // Allows null values while maintaining uniqueness
  },
  
  // Authentication provider: 'local' (email/password) or 'firebase' (Google, Apple, etc.)
  authProvider: { 
    type: String, 
    enum: ['local', 'firebase'], 
    default: 'local' 
  },
  
  // Password hash (only for local auth, optional for Firebase users)
  passwordHash: { type: String },
  
  phone: { type: String },
  
  addresses: [AddressSchema],
  
  // For JWT refresh token invalidation
  refreshTokenHash: { type: String },
  
  // Account status
  active: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  
  lastLoginAt: { type: Date }

}, { timestamps: true });

// Indexes
CustomerSchema.index({ email: 1 }, { unique: true });
CustomerSchema.index({ firebaseUid: 1 }, { unique: true, sparse: true });

// Ensure only one default address
CustomerSchema.pre('save', function(next) {
  if (this.addresses && this.addresses.length > 0) {
    const defaultAddresses = this.addresses.filter(a => a.isDefault);
    if (defaultAddresses.length === 0) {
      this.addresses[0].isDefault = true;
    } else if (defaultAddresses.length > 1) {
      // Keep only the last one as default
      this.addresses.forEach((addr, idx) => {
        addr.isDefault = idx === this.addresses.length - 1 && addr.isDefault;
      });
    }
  }
  next();
});

module.exports = mongoose.model('Customer', CustomerSchema);
