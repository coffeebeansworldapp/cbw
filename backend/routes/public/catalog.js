/**
 * Public Catalog Routes
 * GET /api/public/categories
 * GET /api/public/products
 * GET /api/public/products/:slugOrId
 * GET /api/public/premium-beans
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../../models/Product');
const Category = require('../../models/Category');
const PremiumBean = require('../../models/PremiumBean');

/**
 * GET /categories
 * List all active categories
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ active: { $ne: false } })
      .sort({ sortOrder: 1 })
      .lean();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /products
 * List products with filters and pagination
 * Query params: category, roast, bestseller, search, page, limit
 */
router.get('/products', async (req, res) => {
  try {
    const {
      category,
      roast,
      bestseller,
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter
    const filter = { active: { $ne: false } };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (roast) {
      filter.roast = roast;
    }

    if (bestseller === 'true') {
      filter.bestseller = true;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { region: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ bestseller: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter)
    ]);

    // Add defaultVariant to each product
    const productsWithDefault = products.map(product => {
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
      data: productsWithDefault,
      meta: {
        page: parseInt(page),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /products/:slugOrId
 * Get single product by slug or MongoDB ID
 */
router.get('/products/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;
    
    let product;
    
    // Check if it's a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(slugOrId)) {
      product = await Product.findOne({
        _id: slugOrId,
        active: { $ne: false }
      }).lean();
    }
    
    // If not found by ID, try slug
    if (!product) {
      product = await Product.findOne({
        slug: slugOrId,
        active: { $ne: false }
      }).lean();
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /premium-beans
 * List active premium beans for hero rotator
 */
router.get('/premium-beans', async (req, res) => {
  try {
    const beans = await PremiumBean.find({ active: { $ne: false } })
      .sort({ sortOrder: 1 })
      .lean();

    res.json({
      success: true,
      data: beans
    });
  } catch (error) {
    console.error('Get premium beans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch premium beans',
      code: 'SERVER_ERROR'
    });
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
