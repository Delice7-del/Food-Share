const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Food = require('./models/Food');

const sampleFoods = [
    {
        name: 'Organic Quinoa Salad',
        quantity: '3 large containers',
        description: 'Fresh homemade quinoa salad with cherry tomatoes, cucumber, and lemon dressing. Healthy and delicious!',
        pickupLocation: '456 Green Way, Downtown',
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        dietaryTags: ['Vegan', 'Gluten-free', 'Vegetarian'],
        contactMethod: 'Text: 555-0987',
        imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&auto=format&fit=crop',
    },
    {
        name: 'Whole Wheat Bread',
        quantity: '3 loaves',
        description: 'Freshly baked whole wheat bread. Surplus from today\'s bakery batch.',
        pickupLocation: 'Main Street Bakery, Downtown',
        expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        dietaryTags: ['Vegetarian'],
        contactMethod: 'Visit bakery before 6 PM',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop',
    },
    {
        name: 'Mixed Garden Salad',
        quantity: '4 large bowls',
        description: 'Freshly prepared mixed salad with lettuce, tomatoes, and cucumbers. Dressing included separately.',
        pickupLocation: 'Community Center, West Side',
        expiryDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
        dietaryTags: ['Vegan', 'Low-carb'],
        contactMethod: 'WhatsApp: 555-9876',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop',
    },
    {
        name: 'Canned Vegetable Soup',
        quantity: '10 cans',
        description: 'Unopened cans of various vegetable soups. Long shelf life but clearing out pantry.',
        pickupLocation: 'Greenwood Apartments, Lobby',
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
        dietaryTags: ['Vegetarian', 'Gluten-free'],
        contactMethod: 'Email: donor@example.com',
        imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop',
    },
    {
        name: 'Homestyle Chicken Curry',
        quantity: '5 containers',
        description: 'Delicious homemade chicken curry prepared for a community event. Sealed and fresh.',
        pickupLocation: 'Community Kitchen, Northside',
        expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        dietaryTags: ['Halal'],
        contactMethod: 'Phone: 555-4321',
        imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop',
    },
    {
        name: 'Box of Medjool Dates',
        quantity: '2 boxes',
        description: 'Premium Medjool dates, high quality and unopened. Great energy booster.',
        pickupLocation: 'Downtown Mosque Center',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        dietaryTags: ['Vegan', 'Gluten-free', 'Halal'],
        contactMethod: 'Ask for Ahmed at reception',
        imageUrl: 'https://images.unsplash.com/photo-1559837627-de5ea80a1f43?w=800&auto=format&fit=crop',
    }
];

const seedDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodshare';
        console.log(`Connecting to MongoDB at: ${uri}`);
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // 1. Create a Seed Donor if not exists
        let donor = await User.findOne({ email: 'donor@example.com' });
        if (!donor) {
            donor = await User.create({
                firstName: 'Community',
                lastName: 'Donor',
                email: 'donor@example.com',
                password: 'password123', // Schema will hash this
                phone: '+15550001234',
                role: 'donor',
                organization: 'Local Food Bank',
                location: {
                    type: 'Point',
                    coordinates: [-74.006, 40.7128] // NYC coordinates example
                }
            });
            console.log('Created seed donor user');
        }

        // 2. Clear existing foods to ensure fresh data
        console.log('Clearing existing food listings...');
        await Food.deleteMany({ donor: donor._id });

        // 3. Add sample foods
        for (const foodInfo of sampleFoods) {
            const existing = await Food.findOne({ name: foodInfo.name, donor: donor._id });
            if (!existing) {
                await Food.create({
                    ...foodInfo,
                    donor: donor._id,
                    status: 'available'
                });
                console.log(`Added: ${foodInfo.name}`);
            }
        }

        console.log('Database seeding completed!');
        process.exit();
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDB();
