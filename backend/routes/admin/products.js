/**
 * Admin Products Routes
 * GET    /api/admin/products
 * POST   /api/admin/products
 * PUT    /api/admin/products/:id
 * PATCH  /api/admin/products/:id/variants
 * PATCH  /api/admin/products/:id/active
 * POST   /api/admin/products/:id/images
 * DELETE /api/admin/products/:id/images/:cloudinaryPublicId
 * DELETE /api/admin/products/:id
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { z } = require('zod');
const Product = require('../../models/Product');
const AuditLog = require('../../models/AuditLog');
const { requireAdminAuth, requireRole } = require('../../middleware/auth');
const { ROLES } = require('../../config/constants');

// Apply admin auth to all routes
router.use(requireAdminAuth);

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  category: z.enum(['africa', 'america', 'asia', 'premium', 'all']),
  region: z.string().min(2).max(100),
  basePrice: z.number().positive(),
  roast: z.enum(['Light', 'Medium', 'Dark']),
  image: z.string().url().or(z.string().startsWith('/')),
  features: z.array(z.string()).optional(),
  description: z.string().min(10),
  tastingNotes: z.string().optional(),
  processing: z.string().optional(),
  bestseller: z.boolean().optional(),
  variants: z.array(z.object({
    label: z.string(),
    weightGrams: z.number().positive(),
    sku: z.string(),
    price: z.number().positive(),
    compareAtPrice: z.number().positive().optional(),
    stockQty: z.number().min(0),
    active: z.boolean().optional()
  })).optional()
});

const updateVariantsSchema = z.object({
  variants: z.array(z.object({
    _id: z.string().optional(),
    label: z.string(),
    weightGrams: z.number().positive(),
    sku: z.string(),
    price: z.number().positive(),
    compareAtPrice: z.number().positive().optional(),
    stockQty: z.number().min(0),
    active: z.boolean().optional()
  }))
});

/**
 * GET /products
 * List all products (admin view - includes inactive)
 */
router.get('/', async (req, res) => {
  try {
    const { search, category, active, page = 1, limit = 50 } = req.query;

    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { region: { $regex: search, $options: 'i' } },
        { 'variants.sku': { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (active !== undefined) {
      filter.active = active === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: products,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Admin get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /products/:id
 * Get single product
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();

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
    console.error('Admin get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /products
 * Create new product
 */
router.post('/', requireRole([ROLES.OWNER, ROLES.MANAGER]), async (req, res) => {
  try {
    const validation = createProductSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validation.error.errors
      });
    }

    const product = await Product.create(validation.data);

    // Audit log
    await AuditLog.log({
      adminUserId: req.adminId,
      action: 'PRODUCT_CREATE',
      entityType: 'Product',
      entityId: product._id,
      after: product.toObject(),
      ipAddress: req.ip
    }).catch(() => {});

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Admin create product error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Product with this name or SKU already exists',
        code: 'DUPLICATE'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * PUT /products/:id
 * Update product
 */
router.put('/:id', requireRole([ROLES.OWNER, ROLES.MANAGER]), async (req, res) => {
  try {
    const before = await Product.findById(req.params.id).lean();
    if (!before) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        code: 'NOT_FOUND'
      });
    }

    // Don't allow updating variants through this endpoint
    const { variants, ...updateData } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Audit log
    await AuditLog.log({
      adminUserId: req.adminId,
      action: 'PRODUCT_UPDATE',
      entityType: 'Product',
      entityId: product._id,
      before,
      after: product.toObject(),
      ipAddress: req.ip
    }).catch(() => {});

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Admin update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * PATCH /products/:id/variants
 * Update product variants (stock, prices, etc.)
 */
router.patch('/:id/variants', requireRole([ROLES.OWNER, ROLES.MANAGER]), async (req, res) => {
  try {
    const validation = updateVariantsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validation.error.errors
      });
    }

    const before = await Product.findById(req.params.id).lean();
    if (!before) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        code: 'NOT_FOUND'
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { variants: validation.data.variants },
      { new: true, runValidators: true }
    );

    // Audit log
    await AuditLog.log({
      adminUserId: req.adminId,
      action: 'PRODUCT_VARIANT_UPDATE',
      entityType: 'Product',
      entityId: product._id,
      before: { variants: before.variants },
      after: { variants: product.variants },
      ipAddress: req.ip
    }).catch(() => {});

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Admin update variants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update variants',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * PATCH /products/:id/active
 * Toggle product active status (soft delete/restore)
 */
router.patch('/:id/active', requireRole([ROLES.OWNER, ROLES.MANAGER]), async (req, res) => {
  try {
    const { active } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { active },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        code: 'NOT_FOUND'
      });
    }

    // Audit log
    await AuditLog.log({
      adminUserId: req.adminId,
      action: active ? 'PRODUCT_UPDATE' : 'PRODUCT_DELETE',
      entityType: 'Product',
      entityId: product._id,
      description: active ? 'Product activated' : 'Product deactivated',
      ipAddress: req.ip
    }).catch(() => {});

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Admin toggle product active error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * DELETE /products/:id
 * Soft delete product (set active=false)
 */
router.delete('/:id', requireRole([ROLES.OWNER, ROLES.MANAGER]), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        code: 'NOT_FOUND'
      });
    }

    // Audit log
    await AuditLog.log({
      adminUserId: req.adminId,
      action: 'PRODUCT_DELETE',
      entityType: 'Product',
      entityId: product._id,
      description: 'Product soft deleted',
      ipAddress: req.ip
    }).catch(() => {});

    res.json({
      success: true,
      message: 'Product deleted',
      data: product
    });
  } catch (error) {
    console.error('Admin delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
