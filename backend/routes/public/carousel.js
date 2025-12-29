const express = require('express');
const router = express.Router();
const HomeCarouselSlide = require('../../models/HomeCarouselSlide');

// @desc    Get active carousel slides
// @route   GET /api/public/carousel
// @access  Public
router.get('/', async (req, res) => {
  try {
    const slides = await HomeCarouselSlide.find({ active: true })
      .sort({ sortOrder: 1 })
      .lean();

    res.json({ success: true, slides });
  } catch (error) {
    console.error('Error fetching carousel slides:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
