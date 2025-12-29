/**
 * Database Seed Script
 * Run with: node scripts/seed.js
 * 
 * This will populate the database with initial products, premium beans, categories, and admin user.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('../models/Product');
const PremiumBean = require('../models/PremiumBean');
const Category = require('../models/Category');
const AdminUser = require('../models/AdminUser');
const HomeCarouselSlide = require('../models/HomeCarouselSlide');

const MONGO_URI = process.env.MONGO_URI;

const categories = [
  { slug: 'all', name: 'All', sortOrder: 0 },
  { slug: 'africa', name: 'Africa', description: 'Coffee from African regions', sortOrder: 1 },
  { slug: 'america', name: 'Americas', description: 'Coffee from North & South America', sortOrder: 2 },
  { slug: 'asia', name: 'Asia Pacific', description: 'Coffee from Asia & Pacific regions', sortOrder: 3 },
  { slug: 'premium', name: 'Premium', description: 'Ultra-premium rare coffees', sortOrder: 4 },
];

// Helper to generate variants based on basePrice
const generateVariants = (productSlug, basePrice) => {
  const price250 = Math.round(basePrice * 0.30);  // 30% of 1kg price
  const price500 = Math.round(basePrice * 0.55);  // 55% of 1kg price
  const price1kg = basePrice;                      // Full price
  
  return [
    { label: '250g', weightGrams: 250, sku: `${productSlug}-250g`, price: price250, stockQty: 50, active: true },
    { label: '500g', weightGrams: 500, sku: `${productSlug}-500g`, price: price500, stockQty: 30, active: true },
    { label: '1kg',  weightGrams: 1000, sku: `${productSlug}-1kg`,  price: price1kg, stockQty: 20, active: true },
  ];
};

const products = [
  { 
    name: "Ethiopian Yirgacheffe", 
    slug: "ethiopian-yirgacheffe",
    category: "africa", 
    region: "Ethiopia", 
    basePrice: 85, 
    roast: "Light", 
    image: "/images/premium-beans.png",
    features: ["100% Arabica Beans", "Light Roast Profile", "Floral & Citrus Notes", "Freshly Roasted"],
    description: "Rare, high-grade beans from the Yirgacheffe region with a smooth body, balanced acidity, and a clean finish.",
    tastingNotes: "Bright floral aromatics with citrus undertones, jasmine, bergamot, and a clean lemon finish.",
    variants: generateVariants('ethiopian-yirgacheffe', 85),
    bestseller: false
  },
  { 
    name: "Colombian Supremo", 
    slug: "colombian-supremo",
    category: "america", 
    region: "Colombia", 
    basePrice: 75, 
    roast: "Medium", 
    image: "/images/premium-beans.png",
    features: ["100% Arabica Beans", "Medium Roast", "Nutty & Caramel Notes", "Single Origin"],
    description: "Premium Colombian beans with rich flavor and smooth finish, perfect for everyday brewing.",
    tastingNotes: "Rich caramel sweetness with toasted nuts, brown sugar, and a velvety chocolate finish.",
    variants: generateVariants('colombian-supremo', 75),
    bestseller: true
  },
  { 
    name: "Sumatra Mandheling", 
    slug: "sumatra-mandheling",
    category: "asia", 
    region: "Indonesia", 
    basePrice: 80, 
    roast: "Dark", 
    image: "/images/premium-beans.png",
    features: ["Full Body", "Dark Roast", "Earthy & Herbal Notes", "Low Acidity"],
    description: "Bold Indonesian coffee with full body and complex earthy flavors.",
    tastingNotes: "Deep earthy tones with cedar, dark chocolate, and subtle herbal undertones. Low acidity with a long finish.",
    variants: generateVariants('sumatra-mandheling', 80),
    bestseller: false
  },
  { 
    name: "Kenya AA", 
    slug: "kenya-aa",
    category: "africa", 
    region: "Kenya", 
    basePrice: 90, 
    roast: "Medium", 
    image: "/images/premium-beans.png",
    features: ["100% Arabica", "Medium Roast", "Berry & Wine Notes", "High Altitude"],
    description: "Exceptional Kenyan coffee with bright acidity and wine-like characteristics.",
    tastingNotes: "Vibrant blackcurrant and raspberry notes with wine-like complexity and a sparkling citrus finish.",
    variants: generateVariants('kenya-aa', 90),
    bestseller: false
  },
  { 
    name: "Brazil Santos", 
    slug: "brazil-santos",
    category: "america", 
    region: "Brazil", 
    basePrice: 65, 
    roast: "Medium", 
    image: "/images/premium-beans.png",
    features: ["Smooth & Mild", "Medium Roast", "Chocolate Notes", "Great for Espresso"],
    description: "Classic Brazilian coffee with smooth, chocolatey flavor profile.",
    tastingNotes: "Smooth milk chocolate with hazelnut, subtle spice, and a clean nutty finish. Perfect for espresso.",
    variants: generateVariants('brazil-santos', 65),
    bestseller: false
  },
  { 
    name: "Vietnam Robusta", 
    slug: "vietnam-robusta",
    category: "asia", 
    region: "Vietnam", 
    basePrice: 55, 
    roast: "Dark", 
    image: "/images/premium-beans.png",
    features: ["Strong & Bold", "Dark Roast", "High Caffeine", "Rich Crema"],
    description: "Robust Vietnamese coffee perfect for strong espresso and Vietnamese-style brewing.",
    tastingNotes: "Bold and intense with dark chocolate, roasted grain, and a thick crema. High caffeine content.",
    variants: generateVariants('vietnam-robusta', 55),
    bestseller: false
  },
  { 
    name: "Jamaica Blue Mountain", 
    slug: "jamaica-blue-mountain",
    category: "premium", 
    region: "Jamaica", 
    basePrice: 450, 
    roast: "Medium", 
    image: "/images/Jamica.png",
    features: ["Ultra Premium", "Medium Roast", "Smooth & Balanced", "Limited Availability"],
    description: "One of the world's most sought-after coffees, known for exceptional smoothness and balance.",
    tastingNotes: "Smooth body, mild acidity, sweet floral undertones with hints of chocolate and nuts. Best enjoyed as pour-over, cold brew or espresso.",
    variants: generateVariants('jamaica-blue-mountain', 450),
    bestseller: true
  },
  { 
    name: "Hawaiian Kona", 
    slug: "hawaiian-kona",
    category: "premium", 
    region: "Hawaii", 
    basePrice: 380, 
    roast: "Medium", 
    image: "/images/hawaii-kona.png",
    features: ["Premium Grade", "Medium Roast", "Rich & Smooth", "Volcanic Soil"],
    description: "Luxurious Hawaiian coffee grown on volcanic slopes with exceptional flavor.",
    tastingNotes: "Silky smooth with delicate nutty sweetness, hints of brown sugar, and a polished buttery finish.",
    variants: generateVariants('hawaiian-kona', 380),
    bestseller: false
  },
  { 
    name: "Yemen Mocha", 
    slug: "yemen-mocha",
    category: "premium", 
    region: "Yemen", 
    basePrice: 420, 
    roast: "Dark", 
    image: "/images/yemen.png",
    features: ["Heritage Variety", "Dark Roast", "Complex & Wine-like", "Ancient Origin"],
    description: "Ancient coffee variety with complex wine-like characteristics. Deep, earthy notes with hints of dried fruit.",
    tastingNotes: "Complex wine-like character with dried fruit, dark chocolate, and spice. An ancient heritage variety.",
    variants: generateVariants('yemen-mocha', 420),
    bestseller: false
  },
  { 
    name: "Australia Skybury", 
    slug: "australia-skybury",
    category: "premium", 
    region: "Australia", 
    basePrice: 340, 
    roast: "Medium", 
    image: "/images/australia.png",
    features: ["Rare Origin", "Medium Roast", "Clean & Sweet", "Limited Production"],
    description: "Clean, modern cup with gentle sweetness and a smooth finish. A refined everyday luxury.",
    tastingNotes: "Clean and bright with gentle sweetness, stone fruit notes, and a refined smooth finish.",
    variants: generateVariants('australia-skybury', 340),
    bestseller: false
  },
  { 
    name: "Ecuador Loja", 
    slug: "ecuador-loja",
    category: "premium", 
    region: "Ecuador", 
    basePrice: 320, 
    roast: "Medium", 
    image: "/images/ecuador.png",
    features: ["Specialty Grade", "Medium Roast", "Floral & Caramel", "High Altitude"],
    description: "Soft florals and caramel sweetness with a balanced body. Elegant, smooth, and refined in every sip.",
    tastingNotes: "Soft floral aromatics with caramel sweetness, balanced body, and an elegant smooth finish.",
    variants: generateVariants('ecuador-loja', 320),
    bestseller: false
  },
];

const premiumBeans = [
  {
    beanId: "jamaica",
    kicker: "Coffee Beans World • Premium Collection",
    titleMain: "Jamaica",
    titleSub: "Blue Mountain",
    desc: "Rare, high-grade beans with a smooth body, balanced acidity, and a clean finish. Roasted with precision for coffee lovers who want a truly premium cup.",
    pills: ["• 100% Arabica", "Roast: Medium", "Origin: Jamaica"],
    image: "/images/Jamica.png",
    imgScale: 1.0,
    imgX: 0,
    sortOrder: 0
  },
  {
    beanId: "australia",
    kicker: "Coffee Beans World • Premium Collection",
    titleMain: "Australia",
    titleSub: "Premium",
    desc: "Clean, modern cup with gentle sweetness and a smooth finish. A refined everyday luxury roast profile.",
    pills: ["• 100% Arabica", "Roast: Medium", "Origin: Australia"],
    image: "/images/australia.png",
    imgScale: 1.0,
    imgX: 0,
    sortOrder: 1
  },
  {
    beanId: "hawaii-kona",
    kicker: "Coffee Beans World • Premium Collection",
    titleMain: "Hawaii",
    titleSub: "Kona",
    desc: "Silky and aromatic with delicate nutty sweetness. Famous for its smooth balance and polished finish.",
    pills: ["• 100% Arabica", "Roast: Medium", "Origin: Hawaii Kona"],
    image: "/images/hawaii-kona.png",
    imgScale: 1.0,
    imgX: 0,
    sortOrder: 2
  },
  {
    beanId: "yemen",
    kicker: "Coffee Beans World • Premium Collection",
    titleMain: "Yemen",
    titleSub: "Mocha",
    desc: "Ancient coffee variety with complex wine-like characteristics. Deep, earthy notes with hints of dried fruit. A true connoisseur's choice.",
    pills: ["• Heritage Variety", "Roast: Dark", "Origin: Yemen"],
    image: "/images/yemen.png",
    imgScale: 1.0,
    imgX: 0,
    sortOrder: 3
  },
  {
    beanId: "ecuador",
    kicker: "Coffee Beans World • Premium Collection",
    titleMain: "Ecuador",
    titleSub: "Premium",
    desc: "Soft florals and caramel sweetness with a balanced body. Elegant, smooth, and refined in every sip.",
    pills: ["• 100% Arabica", "Roast: Medium", "Origin: Ecuador"],
    image: "/images/ecuador.png",
    imgScale: 1.0,
    imgX: 0,
    sortOrder: 4
  },
];

// Carousel slides data
const carouselSlides = [
  {
    title: 'Fresh Arabica Beans',
    subtitle: 'Direct from Ethiopian highlands. Experience authentic single-origin coffee.',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=80',
    ctaLabel: 'Shop Now',
    ctaType: 'CATEGORY',
    ctaValue: 'africa',
    sortOrder: 0,
    active: true
  },
  {
    title: 'Premium Collection',
    subtitle: 'Rare, high-grade beans from Jamaica, Hawaii, Yemen and more.',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1600&q=80',
    ctaLabel: 'Explore Premium',
    ctaType: 'CATEGORY',
    ctaValue: 'premium',
    sortOrder: 1,
    active: true
  },
  {
    title: 'Coffee From Around The World',
    subtitle: 'Discover unique flavors from Asia, Africa, Americas and Oceania.',
    imageUrl: 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?auto=format&fit=crop&w=1600&q=80',
    ctaLabel: 'View All',
    ctaType: 'CATEGORY',
    ctaValue: 'all',
    sortOrder: 2,
    active: true
  }
];

// Default admin user (CHANGE PASSWORD IN PRODUCTION!)
const adminUser = {
  name: 'Admin Owner',
  email: 'admin@coffeebeansworld.com',
  password: 'CBW@dmin2025!',  // Will be hashed
  role: 'OWNER'
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: 'coffee_beans_world' });
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Product.deleteMany({});
    await PremiumBean.deleteMany({});
    await Category.deleteMany({});
    await AdminUser.deleteMany({});
    await HomeCarouselSlide.deleteMany({});

    // Seed admin user
    console.log('Seeding admin user...');
    const passwordHash = await bcrypt.hash(adminUser.password, 12);
    await AdminUser.create({
      name: adminUser.name,
      email: adminUser.email,
      passwordHash,
      role: adminUser.role,
      active: true
    });
    console.log(`✓ Created admin user: ${adminUser.email}`);

    // Seed categories
    console.log('Seeding categories...');
    await Category.insertMany(categories);
    console.log(`✓ Inserted ${categories.length} categories`);

    // Seed products
    console.log('Seeding products...');
    await Product.insertMany(products);
    console.log(`✓ Inserted ${products.length} products`);

    // Seed premium beans
    console.log('Seeding premium beans...');
    await PremiumBean.insertMany(premiumBeans);
    console.log(`✓ Inserted ${premiumBeans.length} premium beans`);

    // Seed carousel slides
    console.log('Seeding carousel slides...');
    await HomeCarouselSlide.insertMany(carouselSlides);
    console.log(`✓ Inserted ${carouselSlides.length} carousel slides`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📧 Admin Login:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: ${adminUser.password}`);
    console.log('   ⚠️  Change this password in production!\n');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
