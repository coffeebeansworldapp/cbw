const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true }, // e.g., "africa", "america"
  name: { type: String, required: true }, // e.g., "Africa", "Americas"
  description: { type: String },
  sortOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Category', CategorySchema);
