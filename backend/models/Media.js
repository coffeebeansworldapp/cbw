const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  secureUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String },
  type: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Index for quick lookup by cloudinaryPublicId
MediaSchema.index({ cloudinaryPublicId: 1 });

module.exports = mongoose.model('Media', MediaSchema);
