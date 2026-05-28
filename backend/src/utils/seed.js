require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Drink = require('../models/Drink');

const drinks = [
  {
    name: 'Sunset Fizz',
    category: 'Dirty Soda',
    price: 6.99,
    description: 'Creamy cola with coconut cream, passion fruit, and a splash of vanilla.',
    image: 'https://images.unsplash.com/photo-1622483763798-0667b2531d4c?w=600&q=80',
    availability: true,
  },
  {
    name: 'Berry Bliss',
    category: 'Dirty Soda',
    price: 5.99,
    description: 'Sparkling soda layered with raspberry syrup, fresh cream, and lime.',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80',
    availability: true,
  },
  {
    name: 'Tropical Tide',
    category: 'Dirty Soda',
    price: 6.49,
    description: 'Pineapple soda with mango puree, coconut cream, and crushed ice.',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80',
    availability: true,
  },
  {
    name: 'Citrus Grove',
    category: 'Mocktail',
    price: 7.99,
    description: 'Fresh orange, grapefruit, and mint with sparkling water and honey.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf78f0a0d9?w=600&q=80',
    availability: true,
  },
  {
    name: 'Midnight Bloom',
    category: 'Mocktail',
    price: 8.49,
    description: 'Blueberry, lavender, lemon, and elderflower tonic over crushed ice.',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80',
    availability: true,
  },
  {
    name: 'Garden Spritz',
    category: 'Mocktail',
    price: 7.49,
    description: 'Cucumber, basil, lime, and ginger ale — light and refreshing.',
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&q=80',
    availability: true,
  },
  {
    name: 'Kalma Gold',
    category: 'Cocktail',
    price: 12.99,
    description: 'Premium bourbon, honey, lemon, and a touch of smoked bitters.',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1e?w=600&q=80',
    availability: true,
  },
  {
    name: 'Velvet Mule',
    category: 'Cocktail',
    price: 11.99,
    description: 'Vodka, ginger beer, lime, and fresh rosemary — bold and crisp.',
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb0f32b?w=600&q=80',
    availability: true,
  },
  {
    name: 'Emerald Elixir',
    category: 'Cocktail',
    price: 13.49,
    description: 'Gin, elderflower, cucumber, and tonic with a citrus twist.',
    image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=80',
    availability: true,
  },
];

const seedData = async () => {
  try {
    await connectDB();

    await Drink.deleteMany();
    await Drink.insertMany(drinks);
    console.log('Drinks seeded successfully');

    const adminExists = await User.findOne({ email: 'admin@kalmamixtail.com' });
    if (!adminExists) {
      await User.create({
        name: 'KALMA Admin',
        email: 'admin@kalmamixtail.com',
        password: 'admin123',
        role: 'admin',
      });
      console.log('Admin user created: admin@kalmamixtail.com / admin123');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Seed completed');
    process.exit(0);
  } catch (error) {
    console.error(`Seed error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
