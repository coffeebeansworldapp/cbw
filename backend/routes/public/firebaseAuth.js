/**
 * Firebase Authentication Routes for Mobile App
 * Handles user sync, profile management, and Firebase-authenticated requests
 */

const express = require('express');
const router = express.Router();
const { requireFirebaseAuth } = require('../../middleware/firebaseAuth');
const Customer = require('../../models/Customer');

/**
 * POST /api/public/firebase-auth/sync
 * Sync Firebase user with MongoDB
 * Called after successful Firebase sign-in to ensure user exists in MongoDB
 */
router.post('/sync', requireFirebaseAuth, async (req, res) => {
  try {
    console.log('🔄 Sync request received from:', req.firebaseUser?.email || 'unknown');
    const { phone, addresses } = req.body;
    const customer = req.customer;
    
    // Update additional profile info if provided
    if (phone) {
      customer.phone = phone;
    }
    
    if (addresses && Array.isArray(addresses)) {
      customer.addresses = addresses;
    }
    
    await customer.save();
    
    res.json({
      success: true,
      message: 'User synced successfully',
      data: {
        customer: {
          id: customer._id,
          firebaseUid: customer.firebaseUid,
          email: customer.email,
          fullName: customer.fullName,
          phone: customer.phone,
          emailVerified: customer.emailVerified,
          addresses: customer.addresses,
          createdAt: customer.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Firebase sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync user',
      error: error.message
    });
  }
});

/**
 * GET /api/public/firebase-auth/profile
 * Get current user profile
 */
router.get('/profile', requireFirebaseAuth, async (req, res) => {
  try {
    const customer = req.customer;
    
    res.json({
      success: true,
      data: {
        customer: {
          id: customer._id,
          firebaseUid: customer.firebaseUid,
          email: customer.email,
          fullName: customer.fullName,
          phone: customer.phone,
          emailVerified: customer.emailVerified,
          addresses: customer.addresses,
          active: customer.active,
          lastLoginAt: customer.lastLoginAt,
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
});

/**
 * PATCH /api/public/firebase-auth/profile
 * Update user profile
 */
router.patch('/profile', requireFirebaseAuth, async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const customer = req.customer;
    
    if (fullName) {
      customer.fullName = fullName;
    }
    
    if (phone !== undefined) {
      customer.phone = phone;
    }
    
    await customer.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        customer: {
          id: customer._id,
          email: customer.email,
          fullName: customer.fullName,
          phone: customer.phone,
          emailVerified: customer.emailVerified
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

/**
 * POST /api/public/firebase-auth/addresses
 * Add a new address
 */
router.post('/addresses', requireFirebaseAuth, async (req, res) => {
  try {
    const customer = req.customer;
    const addressData = req.body;
    
    // If this is set as default, unset other defaults
    if (addressData.isDefault) {
      customer.addresses.forEach(addr => addr.isDefault = false);
    }
    
    customer.addresses.push(addressData);
    await customer.save();
    
    const newAddress = customer.addresses[customer.addresses.length - 1];
    
    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: { address: newAddress }
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add address',
      error: error.message
    });
  }
});

/**
 * PATCH /api/public/firebase-auth/addresses/:addressId
 * Update an existing address
 */
router.patch('/addresses/:addressId', requireFirebaseAuth, async (req, res) => {
  try {
    const customer = req.customer;
    const { addressId } = req.params;
    const updateData = req.body;
    
    const address = customer.addresses.id(addressId);
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    // If setting as default, unset other defaults
    if (updateData.isDefault) {
      customer.addresses.forEach(addr => addr.isDefault = false);
    }
    
    Object.assign(address, updateData);
    await customer.save();
    
    res.json({
      success: true,
      message: 'Address updated successfully',
      data: { address }
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update address',
      error: error.message
    });
  }
});

/**
 * DELETE /api/public/firebase-auth/addresses/:addressId
 * Delete an address
 */
router.delete('/addresses/:addressId', requireFirebaseAuth, async (req, res) => {
  try {
    const customer = req.customer;
    const { addressId } = req.params;
    
    const address = customer.addresses.id(addressId);
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    address.deleteOne();
    await customer.save();
    
    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address',
      error: error.message
    });
  }
});

/**
 * DELETE /api/public/firebase-auth/account
 * Delete user account
 */
router.delete('/account', requireFirebaseAuth, async (req, res) => {
  try {
    const customer = req.customer;
    
    // Soft delete - just deactivate the account
    customer.active = false;
    await customer.save();
    
    // Optionally: Delete from Firebase as well
    // await admin.auth().deleteUser(req.firebaseUser.uid);
    
    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
});

module.exports = router;
