const express = require('express');
const router = express.Router();
const HomeCarouselSlide = require('../../models/HomeCarouselSlide');
const PremiumBean = require('../../models/PremiumBean');
const Category = require('../../models/Category');
const Product = require('../../models/Product');

// @desc    Get home page data (aggregator endpoint)
// @route   GET /api/public/home
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Fetch all home sections in parallel
    const [carousel, premiumBeans, categories, featuredProducts] = await Promise.all([
      // Active carousel slides sorted by sortOrder
      HomeCarouselSlide.find({ active: true }).sort({ sortOrder: 1 }).lean(),
      
      // Active premium beans sorted by sortOrder
      PremiumBean.find({ active: true }).sort({ sortOrder: 1 }).lean(),
      
      // Active categories sorted by sortOrder
      Category.find({ active: true }).sort({ sortOrder: 1 }).lean(),
      
      // Featured products (bestsellers or first 12 active products)
      Product.find({ active: true, inStock: true })
        .sort({ bestseller: -1, createdAt: -1 })
        .limit(12)
        .lean()
    ]);

    // Transform products to include defaultVariant
    const productsWithDefault = featuredProducts.map(product => {
      const defaultVariant = getDefaultVariant(product.variants);
      return {
        ...product,
        defaultVariant: defaultVariant ? {
          variantId: defaultVariant._id,
          label: defaultVariant.label,
          price: defaultVariant.price,
          compareAtPrice: defaultVariant.compareAtPrice,
          stockQty: defaultVariant.stockQty
        } : null
      };
    });

    res.json({
      success: true,
      carousel,
      premiumBeans,
      categories,
      featuredProducts: productsWithDefault,
      meta: {
        version: 1,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching home data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Helper function to get default variant
// Prefers 250g, then 500g, then 1kg, then first active in-stock
function getDefaultVariant(variants) {
  if (!variants || variants.length === 0) return null;

  const activeInStock = variants.filter(v => v.active && v.stockQty > 0);
  if (activeInStock.length === 0) {
    // Return first variant even if out of stock (for display purposes)
    return variants.find(v => v.active) || variants[0];
  }

  // Preferred order: 250g, 500g, 1kg
  const preferredWeights = [250, 500, 1000];
  for (const weight of preferredWeights) {
    const variant = activeInStock.find(v => v.weightGrams === weight);
    if (variant) return variant;
  }

  // Return first active in-stock variant
  return activeInStock[0];
}

module.exports = router;
