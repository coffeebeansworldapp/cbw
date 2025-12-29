const express = require('express');
const router = express.Router();
const HomeCarouselSlide = require('../../models/HomeCarouselSlide');
const { requireAdminAuth, requireRole } = require('../../middleware/auth');

// @desc    Get all carousel slides (admin)
// @route   GET /api/admin/carousel
// @access  Admin
router.get('/', requireAdminAuth, async (req, res) => {
  try {
    const slides = await HomeCarouselSlide.find().sort({ sortOrder: 1 });
    res.json({ success: true, slides });
  } catch (error) {
    console.error('Error fetching carousel slides:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get single carousel slide
// @route   GET /api/admin/carousel/:id
// @access  Admin
router.get('/:id', requireAdminAuth, async (req, res) => {
  try {
    const slide = await HomeCarouselSlide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ success: false, message: 'Slide not found' });
    }
    res.json({ success: true, slide });
  } catch (error) {
    console.error('Error fetching carousel slide:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Create carousel slide
// @route   POST /api/admin/carousel
// @access  Admin
router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const { title, subtitle, imageUrl, cloudinaryPublicId, ctaLabel, ctaType, ctaValue, active } = req.body;

    // Get max sortOrder and add 1
    const maxSort = await HomeCarouselSlide.findOne().sort({ sortOrder: -1 }).select('sortOrder');
    const sortOrder = maxSort ? maxSort.sortOrder + 1 : 0;

    const slide = await HomeCarouselSlide.create({
      title,
      subtitle,
      imageUrl,
      cloudinaryPublicId,
      ctaLabel,
      ctaType,
      ctaValue,
      sortOrder,
      active: active !== undefined ? active : true
    });

    res.status(201).json({ success: true, slide });
  } catch (error) {
    console.error('Error creating carousel slide:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Update carousel slide
// @route   PUT /api/admin/carousel/:id
// @access  Admin
router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { title, subtitle, imageUrl, cloudinaryPublicId, ctaLabel, ctaType, ctaValue, active } = req.body;

    const slide = await HomeCarouselSlide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ success: false, message: 'Slide not found' });
    }

    // Update fields
    if (title !== undefined) slide.title = title;
    if (subtitle !== undefined) slide.subtitle = subtitle;
    if (imageUrl !== undefined) slide.imageUrl = imageUrl;
    if (cloudinaryPublicId !== undefined) slide.cloudinaryPublicId = cloudinaryPublicId;
    if (ctaLabel !== undefined) slide.ctaLabel = ctaLabel;
    if (ctaType !== undefined) slide.ctaType = ctaType;
    if (ctaValue !== undefined) slide.ctaValue = ctaValue;
    if (active !== undefined) slide.active = active;

    await slide.save();

    res.json({ success: true, slide });
  } catch (error) {
    console.error('Error updating carousel slide:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delete carousel slide
// @route   DELETE /api/admin/carousel/:id
// @access  Admin
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const slide = await HomeCarouselSlide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ success: false, message: 'Slide not found' });
    }

    await slide.deleteOne();

    res.json({ success: true, message: 'Slide deleted' });
  } catch (error) {
    console.error('Error deleting carousel slide:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Reorder carousel slides
// @route   PUT /api/admin/carousel/reorder
// @access  Admin
router.put('/reorder/batch', requireAdminAuth, async (req, res) => {
  try {
    const { slideIds } = req.body; // Array of slide IDs in new order

    if (!Array.isArray(slideIds)) {
      return res.status(400).json({ success: false, message: 'slideIds must be an array' });
    }

    // Update sortOrder for each slide
    const updates = slideIds.map((id, index) => 
      HomeCarouselSlide.findByIdAndUpdate(id, { sortOrder: index })
    );

    await Promise.all(updates);

    const slides = await HomeCarouselSlide.find().sort({ sortOrder: 1 });
    res.json({ success: true, slides });
  } catch (error) {
    console.error('Error reordering carousel slides:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Toggle carousel slide active status
// @route   PATCH /api/admin/carousel/:id/toggle
// @access  Admin
router.patch('/:id/toggle', requireAdminAuth, async (req, res) => {
  try {
    const slide = await HomeCarouselSlide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ success: false, message: 'Slide not found' });
    }

    slide.active = !slide.active;
    await slide.save();

    res.json({ success: true, slide });
  } catch (error) {
    console.error('Error toggling carousel slide:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
