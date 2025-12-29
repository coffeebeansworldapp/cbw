const mongoose = require('mongoose');

const PremiumBeanSchema = new mongoose.Schema({
  beanId: { type: String, required: true, unique: true }, // e.g., "jamaica", "australia"
  kicker: { type: String, default: 'Coffee Beans World • Premium Collection' },
  titleMain: { type: String, required: true },
  titleSub: { type: String, required: true },
  desc: { type: String, required: true },
  pills: [{ type: String }],
  image: { type: String, required: true },
  cloudinaryPublicId: { type: String },
  imgScale: { type: Number, default: 1.0 },
  imgX: { type: Number, default: 0 },
  sortOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  // Link to a product for direct navigation
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PremiumBean', PremiumBeanSchema);
