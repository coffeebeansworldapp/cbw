const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const Media = require('../models/Media');
const clouderia = require('../services/clouderia');

// store uploads temporarily in backend/tmp
const tmpDir = path.join(__dirname, '..', 'tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tmpDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// POST /api/media/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const uploadResult = await clouderia.uploadToCloudinary(req.file.path, req.file.mimetype);

    const media = await Media.create({
      filename: req.file.originalname,
      secureUrl: uploadResult.url,
      type: req.file.mimetype,
      cloudinaryPublicId: uploadResult.id
    });

    // remove temp file
    fs.unlink(req.file.path, () => {});
    
    // Return in a format the admin panel expects
    res.json({
      _id: media._id,
      filename: media.filename,
      url: media.secureUrl,
      clouderiaId: media.cloudinaryPublicId,
      type: media.type
    });
  } catch (err) {
    console.error('Media upload error:', err);
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

module.exports = router;
