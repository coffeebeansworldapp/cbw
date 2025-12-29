const express = require('express');
const router = express.Router();
const PremiumBean = require('../models/PremiumBean');

// GET /api/premium-beans - Get all active premium beans for rotator
router.get('/', async (req, res) => {
  try {
    const beans = await PremiumBean.find({ active: true }).sort({ sortOrder: 1 });
    res.json(beans);
  } catch (err) {
    console.error('Error fetching premium beans:', err);
    res.status(500).json({ error: 'Failed to fetch premium beans' });
  }
});

// GET /api/premium-beans/:id - Get single premium bean
router.get('/:id', async (req, res) => {
  try {
    const bean = await PremiumBean.findById(req.params.id);
    if (!bean) {
      return res.status(404).json({ error: 'Premium bean not found' });
    }
    res.json(bean);
  } catch (err) {
    console.error('Error fetching premium bean:', err);
    res.status(500).json({ error: 'Failed to fetch premium bean' });
  }
});

// POST /api/premium-beans - Create new premium bean (admin)
router.post('/', async (req, res) => {
  try {
    const bean = await PremiumBean.create(req.body);
    res.status(201).json(bean);
  } catch (err) {
    console.error('Error creating premium bean:', err);
    res.status(500).json({ error: 'Failed to create premium bean' });
  }
});

// PUT /api/premium-beans/:id - Update premium bean (admin)
router.put('/:id', async (req, res) => {
  try {
    const bean = await PremiumBean.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!bean) {
      return res.status(404).json({ error: 'Premium bean not found' });
    }
    res.json(bean);
  } catch (err) {
    console.error('Error updating premium bean:', err);
    res.status(500).json({ error: 'Failed to update premium bean' });
  }
});

// DELETE /api/premium-beans/:id - Delete premium bean (admin)
router.delete('/:id', async (req, res) => {
  try {
    const bean = await PremiumBean.findByIdAndDelete(req.params.id);
    if (!bean) {
      return res.status(404).json({ error: 'Premium bean not found' });
    }
    res.json({ message: 'Premium bean deleted' });
  } catch (err) {
    console.error('Error deleting premium bean:', err);
    res.status(500).json({ error: 'Failed to delete premium bean' });
  }
});

module.exports = router;
