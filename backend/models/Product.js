const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  label: { type: String, required: true },        // "250g", "500g", "1kg"
  weightGrams: { type: Number, required: true },  // 250, 500, 1000
  sku: { type: String, required: true, unique: true },
  price: { type: Number, required: true },        // FINAL price used in checkout
  compareAtPrice: { type: Number },               // optional strike-through price
  stockQty: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { _id: true });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },           // SEO + Flutter friendly

  category: { 
    type: String, 
    required: true,
    enum: ['africa', 'america', 'asia', 'premium', 'all']
  },

  region: { type: String, required: true },

  // Keep for backward compatibility (DO NOT USE FOR CHECKOUT)
  basePrice: { type: Number, required: true },

  roast: { 
    type: String, 
    required: true,
    enum: ['Light', 'Medium', 'Dark']
  },

  // Primary image
  image: { type: String, required: true },

  // Future-ready gallery
  images: [{
    secureUrl: String,
    cloudinaryPublicId: String
  }],

  variants: [VariantSchema],   // ⭐ CORE ECOMMERCE - use for checkout

  features: [{ type: String }],
  description: { type: String, required: true },
  tastingNotes: { type: String },
  processing: { type: String, default: 'Washed' },

  bestseller: { type: Boolean, default: false },
  active: { type: Boolean, default: true },

  // Computed dynamically from variants
  inStock: { type: Boolean, default: true }

}, { timestamps: true });

// Auto-generate slug + compute inStock
ProductSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Auto-compute inStock from variants
  if (this.variants && this.variants.length) {
    this.inStock = this.variants.some(v => v.active && v.stockQty > 0);
  }

  next();
});

module.exports = mongoose.model('Product', ProductSchema);
