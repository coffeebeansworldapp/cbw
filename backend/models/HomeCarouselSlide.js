const mongoose = require('mongoose');

const HomeCarouselSlideSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  imageUrl: { type: String, required: true },     // Cloudinary URL
  cloudinaryPublicId: { type: String },           // For image management
  ctaLabel: { type: String, default: 'Shop Now' },
  ctaType: { 
    type: String, 
    enum: ['PRODUCT', 'CATEGORY', 'COLLECTION', 'URL', 'NONE'],
    default: 'CATEGORY'
  },
  ctaValue: { type: String },                     // productId, categorySlug, or URL
  sortOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

// Index for sorted active slides
HomeCarouselSlideSchema.index({ active: 1, sortOrder: 1 });

module.exports = mongoose.model('HomeCarouselSlide', HomeCarouselSlideSchema);
