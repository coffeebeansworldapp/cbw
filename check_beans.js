const mongoose = require('mongoose');
const PremiumBean = require('./backend/models/PremiumBean');

async function checkBeans() {
  try {
    await mongoose.connect('mongodb://localhost:27017/coffee-beans-world');
    const beans = await PremiumBean.find();
    console.log('Premium Beans found:', JSON.stringify(beans, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkBeans();
