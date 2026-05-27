// ===========================================
// DATABASE SEED SCRIPT
// ===========================================
// WHAT: Fills your database with sample data for testing
// WHY: So you don't have to manually create products one by one
// HOW TO RUN: npm run seed
// ===========================================

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

// Import models
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Offer = require('../models/Offer');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Offer.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ---- Create Admin User ----
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@groceryapp.com',
      phone: '9876543210',
      password: 'admin123',
      customerType: 'retail',
      role: 'admin',
      address: {
        street: 'CG Road',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380009',
      },
    });
    console.log('👤 Admin user created');

    // ---- Create Test Users ----
    await User.create([
      {
        name: 'Rajesh Patel',
        email: 'rajesh@test.com',
        phone: '9876543211',
        password: 'test1234',
        customerType: 'retail',
        address: {
          street: 'Satellite Road',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '380015',
        },
      },
      {
        name: 'Mehul Shah',
        email: 'mehul@test.com',
        phone: '9876543212',
        password: 'test1234',
        customerType: 'wholesale',
        address: {
          street: 'Kalupur Market',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '380001',
        },
      },
    ]);
    console.log('👥 Test users created');

    // ---- Create Categories ----
    const categories = await Category.create([
      { name: 'Dal & Pulses', image: { url: '/images/categories/dal.jpg' } },
      { name: 'Rice & Grains', image: { url: '/images/categories/rice.jpg' } },
      { name: 'Spices & Masala', image: { url: '/images/categories/spices.jpg' } },
      { name: 'Flour & Atta', image: { url: '/images/categories/flour.jpg' } },
      { name: 'Cooking Oil', image: { url: '/images/categories/oil.jpg' } },
      { name: 'Sugar & Jaggery', image: { url: '/images/categories/sugar.jpg' } },
      { name: 'Dry Fruits', image: { url: '/images/categories/dryfruits.jpg' } },
      { name: 'Salt & Condiments', image: { url: '/images/categories/salt.jpg' } },
    ]);
    console.log('📂 Categories created');

    // Helper to find category by name
    const cat = (name) => categories.find((c) => c.name === name)._id;

    // ---- Create Products ----
    const products = await Product.create([
      // Dal & Pulses
      {
        name: 'Toor Dal (Arhar)',
        category: cat('Dal & Pulses'),
        description: 'Premium quality Toor Dal, sourced from best farms. Perfect for everyday dal preparation.',
        price: 160,
        wholesalePrice: 140,
        stock: 500,
        unit: 'kg',
        discount: 0,
        images: [{ url: '/images/products/toor-dal.jpg' }],
        variants: [
          { size: '1 kg', price: 160, wholesalePrice: 140, stock: 200 },
          { size: '5 kg', price: 780, wholesalePrice: 680, stock: 100 },
          { size: '10 kg', price: 1500, wholesalePrice: 1300, stock: 50 },
        ],
      },
      {
        name: 'Moong Dal',
        category: cat('Dal & Pulses'),
        description: 'Split green gram dal. Light and easy to digest. Ideal for khichdi and dal fry.',
        price: 140,
        wholesalePrice: 120,
        stock: 400,
        unit: 'kg',
        discount: 5,
        images: [{ url: '/images/products/moong-dal.jpg' }],
        variants: [
          { size: '1 kg', price: 140, wholesalePrice: 120, stock: 150 },
          { size: '5 kg', price: 680, wholesalePrice: 580, stock: 80 },
        ],
      },
      {
        name: 'Chana Dal',
        category: cat('Dal & Pulses'),
        description: 'Bengal gram split. Used in dal tadka, sweets, and snacks.',
        price: 110,
        wholesalePrice: 95,
        stock: 350,
        unit: 'kg',
        images: [{ url: '/images/products/chana-dal.jpg' }],
        variants: [
          { size: '1 kg', price: 110, wholesalePrice: 95, stock: 150 },
          { size: '5 kg', price: 530, wholesalePrice: 460, stock: 60 },
        ],
      },
      {
        name: 'Masoor Dal (Red Lentil)',
        category: cat('Dal & Pulses'),
        description: 'Quick-cooking red lentils. Popular for everyday meals in Indian households.',
        price: 120,
        wholesalePrice: 105,
        stock: 300,
        unit: 'kg',
        images: [{ url: '/images/products/masoor-dal.jpg' }],
      },
      {
        name: 'Urad Dal (Black Gram)',
        category: cat('Dal & Pulses'),
        description: 'Split black gram. Essential for making Dal Makhani, Medu Vada, and Idli batter.',
        price: 170,
        wholesalePrice: 150,
        stock: 250,
        unit: 'kg',
        images: [{ url: '/images/products/urad-dal.jpg' }],
      },

      // Rice & Grains
      {
        name: 'Basmati Rice Premium',
        category: cat('Rice & Grains'),
        description: 'Long-grain aromatic basmati rice. Aged for 2 years for the best biryani and pulao.',
        price: 180,
        wholesalePrice: 155,
        stock: 600,
        unit: 'kg',
        discount: 10,
        images: [{ url: '/images/products/basmati-rice.jpg' }],
        variants: [
          { size: '1 kg', price: 180, wholesalePrice: 155, stock: 200 },
          { size: '5 kg', price: 870, wholesalePrice: 750, stock: 150 },
          { size: '10 kg', price: 1700, wholesalePrice: 1450, stock: 100 },
          { size: '25 kg', price: 4200, wholesalePrice: 3600, stock: 50 },
        ],
      },
      {
        name: 'Sona Masoori Rice',
        category: cat('Rice & Grains'),
        description: 'Lightweight everyday rice. Less starch, easy to digest. Great for daily meals.',
        price: 70,
        wholesalePrice: 58,
        stock: 400,
        unit: 'kg',
        images: [{ url: '/images/products/sona-masoori.jpg' }],
      },
      {
        name: 'Wheat Grain',
        category: cat('Rice & Grains'),
        description: 'Premium MP wheat grains. Get it milled fresh for the best chapati flour.',
        price: 40,
        wholesalePrice: 32,
        stock: 800,
        unit: 'kg',
        images: [{ url: '/images/products/wheat.jpg' }],
        variants: [
          { size: '5 kg', price: 195, wholesalePrice: 155, stock: 200 },
          { size: '10 kg', price: 380, wholesalePrice: 310, stock: 150 },
          { size: '30 kg', price: 1100, wholesalePrice: 920, stock: 100 },
        ],
      },

      // Spices & Masala
      {
        name: 'Turmeric Powder (Haldi)',
        category: cat('Spices & Masala'),
        description: 'Pure Sangli turmeric. High curcumin content. No artificial colors added.',
        price: 280,
        wholesalePrice: 240,
        stock: 200,
        unit: 'kg',
        images: [{ url: '/images/products/turmeric.jpg' }],
        variants: [
          { size: '100 g', price: 35, wholesalePrice: 28, stock: 100 },
          { size: '500 g', price: 145, wholesalePrice: 125, stock: 80 },
          { size: '1 kg', price: 280, wholesalePrice: 240, stock: 60 },
        ],
      },
      {
        name: 'Red Chilli Powder',
        category: cat('Spices & Masala'),
        description: 'Medium-hot Kashmiri red chilli powder. Gives rich red color to curries.',
        price: 350,
        wholesalePrice: 300,
        stock: 150,
        unit: 'kg',
        images: [{ url: '/images/products/red-chilli.jpg' }],
        variants: [
          { size: '100 g', price: 40, wholesalePrice: 34, stock: 100 },
          { size: '500 g', price: 180, wholesalePrice: 155, stock: 60 },
          { size: '1 kg', price: 350, wholesalePrice: 300, stock: 40 },
        ],
      },
      {
        name: 'Cumin Seeds (Jeera)',
        category: cat('Spices & Masala'),
        description: 'Whole cumin seeds. Essential for tadka, biryani, and raita.',
        price: 420,
        wholesalePrice: 370,
        stock: 100,
        unit: 'kg',
        images: [{ url: '/images/products/cumin.jpg' }],
      },
      {
        name: 'Garam Masala',
        category: cat('Spices & Masala'),
        description: 'Freshly ground blend of 12 whole spices. Authentic Gujarati recipe.',
        price: 500,
        wholesalePrice: 430,
        stock: 80,
        unit: 'kg',
        images: [{ url: '/images/products/garam-masala.jpg' }],
        variants: [
          { size: '100 g', price: 55, wholesalePrice: 48, stock: 50 },
          { size: '250 g', price: 130, wholesalePrice: 112, stock: 30 },
        ],
      },

      // Flour & Atta
      {
        name: 'Wheat Flour (Chakki Atta)',
        category: cat('Flour & Atta'),
        description: 'Stone-ground whole wheat flour. Makes soft, fluffy rotis every time.',
        price: 50,
        wholesalePrice: 42,
        stock: 500,
        unit: 'kg',
        images: [{ url: '/images/products/wheat-flour.jpg' }],
        variants: [
          { size: '5 kg', price: 240, wholesalePrice: 205, stock: 200 },
          { size: '10 kg', price: 470, wholesalePrice: 400, stock: 150 },
        ],
      },
      {
        name: 'Besan (Gram Flour)',
        category: cat('Flour & Atta'),
        description: 'Fine chickpea flour. Perfect for pakoras, dhokla, and Gujarati kadhi.',
        price: 120,
        wholesalePrice: 100,
        stock: 200,
        unit: 'kg',
        images: [{ url: '/images/products/besan.jpg' }],
      },

      // Cooking Oil
      {
        name: 'Groundnut Oil',
        category: cat('Cooking Oil'),
        description: 'Cold-pressed groundnut oil. The traditional choice for Gujarati cooking.',
        price: 210,
        wholesalePrice: 185,
        stock: 300,
        unit: 'litre',
        images: [{ url: '/images/products/groundnut-oil.jpg' }],
        variants: [
          { size: '1 litre', price: 210, wholesalePrice: 185, stock: 150 },
          { size: '5 litre', price: 1020, wholesalePrice: 900, stock: 80 },
          { size: '15 litre', price: 3000, wholesalePrice: 2650, stock: 40 },
        ],
      },
      {
        name: 'Mustard Oil',
        category: cat('Cooking Oil'),
        description: 'Pure kachi ghani mustard oil. Strong flavour, used in pickles and cooking.',
        price: 190,
        wholesalePrice: 165,
        stock: 200,
        unit: 'litre',
        images: [{ url: '/images/products/mustard-oil.jpg' }],
      },

      // Sugar & Jaggery
      {
        name: 'Sugar (Cheeni)',
        category: cat('Sugar & Jaggery'),
        description: 'Refined white sugar. Medium grain. Sulphur-free processing.',
        price: 45,
        wholesalePrice: 38,
        stock: 500,
        unit: 'kg',
        images: [{ url: '/images/products/sugar.jpg' }],
        variants: [
          { size: '1 kg', price: 45, wholesalePrice: 38, stock: 200 },
          { size: '5 kg', price: 215, wholesalePrice: 185, stock: 100 },
        ],
      },
      {
        name: 'Jaggery (Gur)',
        category: cat('Sugar & Jaggery'),
        description: 'Organic sugarcane jaggery from Kolhapur. Rich in iron and minerals.',
        price: 80,
        wholesalePrice: 65,
        stock: 200,
        unit: 'kg',
        images: [{ url: '/images/products/jaggery.jpg' }],
      },

      // Dry Fruits
      {
        name: 'Almonds (Badam)',
        category: cat('Dry Fruits'),
        description: 'California almonds. Grade A quality. Perfect for snacking and milk shakes.',
        price: 900,
        wholesalePrice: 780,
        stock: 50,
        unit: 'kg',
        discount: 5,
        images: [{ url: '/images/products/almonds.jpg' }],
        variants: [
          { size: '250 g', price: 240, wholesalePrice: 205, stock: 30 },
          { size: '500 g', price: 460, wholesalePrice: 395, stock: 20 },
          { size: '1 kg', price: 900, wholesalePrice: 780, stock: 15 },
        ],
      },
      {
        name: 'Cashews (Kaju)',
        category: cat('Dry Fruits'),
        description: 'Goa W240 grade cashews. Whole, unbroken. Great for sweets and cooking.',
        price: 850,
        wholesalePrice: 740,
        stock: 40,
        unit: 'kg',
        images: [{ url: '/images/products/cashews.jpg' }],
        variants: [
          { size: '250 g', price: 225, wholesalePrice: 195, stock: 25 },
          { size: '500 g', price: 435, wholesalePrice: 375, stock: 15 },
        ],
      },

      // Salt & Condiments
      {
        name: 'Tata Salt',
        category: cat('Salt & Condiments'),
        description: 'Iodized vacuum-evaporated salt. India\'s trusted salt brand.',
        price: 25,
        wholesalePrice: 20,
        stock: 400,
        unit: 'kg',
        images: [{ url: '/images/products/salt.jpg' }],
      },
    ]);
    console.log(`🛒 ${products.length} Products created`);

    // ---- Create Sample Offers ----
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    await Offer.create([
      {
        title: 'Summer Special - Basmati Rice 10% Off',
        product: products.find((p) => p.name === 'Basmati Rice Premium')._id,
        discountPercent: 10,
        validTill: thirtyDaysLater,
        applicableTo: 'both',
      },
      {
        title: 'Wholesale Bonanza - Almonds 15% Off',
        product: products.find((p) => p.name === 'Almonds (Badam)')._id,
        discountPercent: 15,
        validTill: thirtyDaysLater,
        applicableTo: 'wholesale',
      },
      {
        title: 'Moong Dal Festival Deal',
        product: products.find((p) => p.name === 'Moong Dal')._id,
        discountPercent: 5,
        validTill: thirtyDaysLater,
        applicableTo: 'both',
      },
    ]);
    console.log('🏷️  Offers created');

    console.log('\n✨ Database seeded successfully!\n');
    console.log('📋 Test Credentials:');
    console.log('   Admin:     admin@groceryapp.com / admin123');
    console.log('   Retail:    rajesh@test.com / test1234');
    console.log('   Wholesale: mehul@test.com / test1234\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
