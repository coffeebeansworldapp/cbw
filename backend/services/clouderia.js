const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');

/**
 * Upload file to Cloudinary
 */
async function uploadToCloudinary(filePath, options = {}) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'coffee-beans-world',
      resource_type: 'auto',
      ...options
    });
    
    return { 
      id: result.public_id, 
      url: result.secure_url,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error.message);
    throw error;
  }
}

/**
 * Delete file from Cloudinary
 */
async function deleteFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
    throw error;
  }
}

// Keep legacy function name for backward compatibility
async function uploadToClouderia(filePath, mimeType) {
  return uploadToCloudinary(filePath);
}

module.exports = { 
  uploadToCloudinary, 
  uploadToClouderia, 
  deleteFromCloudinary 
};
