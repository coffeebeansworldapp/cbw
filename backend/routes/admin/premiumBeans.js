const express = require('express');
const router = express.Router();
const PremiumBean = require('../../models/PremiumBean');
const { requireAdminAuth } = require('../../middleware/auth');

// @desc    Get all premium beans (admin)
// @route   GET /api/admin/premium-beans
// @access  Admin
router.get('/', requireAdminAuth, async (req, res) => {
  try {
    const beans = await PremiumBean.find().sort({ sortOrder: 1 });
    res.json({ success: true, beans });
  } catch (error) {
    console.error('Error fetching premium beans:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get single premium bean
// @route   GET /api/admin/premium-beans/:id
// @access  Admin
router.get('/:id', requireAdminAuth, async (req, res) => {
  try {
    const bean = await PremiumBean.findById(req.params.id);
    if (!bean) {
      return res.status(404).json({ success: false, message: 'Premium bean not found' });
    }
    res.json({ success: true, bean });
  } catch (error) {
    console.error('Error fetching premium bean:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Create premium bean
// @route   POST /api/admin/premium-beans
// @access  Admin
router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const { 
      beanId, kicker, titleMain, titleSub, 
      desc, pills, image, cloudinaryPublicId, 
      imgScale, imgX, productId, active 
    } = req.body;

    // Get max sortOrder and add 1
    const maxSort = await PremiumBean.findOne().sort({ sortOrder: -1 }).select('sortOrder');
    const sortOrder = maxSort ? maxSort.sortOrder + 1 : 0;

    const bean = await PremiumBean.create({
      beanId,
      kicker,
      titleMain,
      titleSub,
      desc,
      pills,
      image,
      cloudinaryPublicId,
      imgScale,
      imgX,
      productId,
      sortOrder,
      active: active !== undefined ? active : true
    });

    res.status(201).json({ success: true, bean });
  } catch (error) {
    console.error('Error creating premium bean:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Bean ID must be unique' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Update premium bean
// @route   PUT /api/admin/premium-beans/:id
// @access  Admin
router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { 
      beanId, kicker, titleMain, titleSub, 
      desc, pills, image, cloudinaryPublicId, 
      imgScale, imgX, productId, active 
    } = req.body;

    const bean = await PremiumBean.findById(req.params.id);
    if (!bean) {
      return res.status(404).json({ success: false, message: 'Premium bean not found' });
    }

    // Update fields
    if (beanId !== undefined) bean.beanId = beanId;
    if (kicker !== undefined) bean.kicker = kicker;
    if (titleMain !== undefined) bean.titleMain = titleMain;
    if (titleSub !== undefined) bean.titleSub = titleSub;
    if (desc !== undefined) bean.desc = desc;
    if (pills !== undefined) bean.pills = pills;
    if (image !== undefined) bean.image = image;
    if (cloudinaryPublicId !== undefined) bean.cloudinaryPublicId = cloudinaryPublicId;
    if (imgScale !== undefined) bean.imgScale = imgScale;
    if (imgX !== undefined) bean.imgX = imgX;
    if (productId !== undefined) bean.productId = productId || null;
    if (active !== undefined) bean.active = active;

    await bean.save();

    res.json({ success: true, bean });
  } catch (error) {
    console.error('Error updating premium bean:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Bean ID must be unique' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delete premium bean
// @route   DELETE /api/admin/premium-beans/:id
// @access  Admin
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const bean = await PremiumBean.findById(req.params.id);
    if (!bean) {
      return res.status(404).json({ success: false, message: 'Premium bean not found' });
    }

    await bean.deleteOne();

    res.json({ success: true, message: 'Premium bean deleted' });
  } catch (error) {
    console.error('Error deleting premium bean:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Reorder premium beans
// @route   PUT /api/admin/premium-beans/reorder/batch
// @access  Admin
router.put('/reorder/batch', requireAdminAuth, async (req, res) => {
  try {
    const { beanIds } = req.body; // Array of bean IDs in new order

    if (!Array.isArray(beanIds)) {
      return res.status(400).json({ success: false, message: 'beanIds must be an array' });
    }

    // Update sortOrder for each bean
    const updates = beanIds.map((id, index) => 
      PremiumBean.findByIdAndUpdate(id, { sortOrder: index })
    );

    await Promise.all(updates);

    const beans = await PremiumBean.find().sort({ sortOrder: 1 });
    res.json({ success: true, beans });
  } catch (error) {
    console.error('Error reordering premium beans:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Toggle premium bean active status
// @route   PATCH /api/admin/premium-beans/:id/toggle
// @access  Admin
router.patch('/:id/toggle', requireAdminAuth, async (req, res) => {
  try {
    const bean = await PremiumBean.findById(req.params.id);
    if (!bean) {
      return res.status(404).json({ success: false, message: 'Premium bean not found' });
    }

    bean.active = !bean.active;
    await bean.save();

    res.json({ success: true, bean });
  } catch (error) {
    console.error('Error toggling premium bean:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
