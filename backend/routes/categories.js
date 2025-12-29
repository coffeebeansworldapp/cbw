const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// GET /api/categories - Get all active categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ active: true }).sort({ sortOrder: 1 });
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/categories - Create category (admin)
router.post('/', async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

module.exports = router;
