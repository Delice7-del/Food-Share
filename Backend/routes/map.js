const express = require('express');
const { query, validationResult } = require('express-validator');
const Donation = require('../models/Donation');
const User = require('../models/User');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();


router.get('/donations', [
  query('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
  query('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required'),
  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 100 })
    .withMessage('Radius must be between 0.1 and 100 miles'),
  query('category')
    .optional()
    .isIn(['fruits', 'vegetables', 'grains', 'dairy', 'meat', 'canned', 'baked', 'frozen', 'beverages', 'snacks', 'other'])
    .withMessage('Invalid category'),
  query('status')
    .optional()
    .isIn(['available', 'reserved', 'picked-up'])
    .withMessage('Invalid status'),
  query('urgent')
    .optional()
    .isBoolean()
    .withMessage('Urgent must be true or false')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      lat,
      lng,
      radius = 25,
      category,
      status = 'available',
      urgent
    } = req.query;

    const coordinates = [parseFloat(lng), parseFloat(lat)];

    // Build query
    const query = {
      status,
      expiryDate: { $gt: new Date() }
    };

    if (category) query.category = category;
    if (urgent !== undefined) query.isUrgent = urgent === 'true';

    // Find donations by location
    const donations = await Donation.find({
      ...query,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: parseFloat(radius) * 1609.34 // Convert miles to meters
        }
      }
    })
    .populate('donor', 'firstName lastName organization')
    .limit(100); // Limit results for map performance

    // Format data for map
    const mapData = donations.map(donation => ({
      id: donation._id,
      type: 'donation',
      title: donation.title,
      category: donation.category,
      status: donation.status,
      isUrgent: donation.isUrgent,
      coordinates: donation.location.coordinates,
      address: donation.location.address,
      pickupDate: donation.pickupDate,
      pickupTime: donation.pickupTime,
      quantity: donation.quantity,
      expiryDate: donation.expiryDate,
      daysUntilExpiry: donation.daysUntilExpiry,
      donor: donation.donor,
      dietary: donation.dietary,
      storage: donation.storage
    }));

    res.json({
      success: true,
      data: {
        donations: mapData,
        center: { lat: parseFloat(lat), lng: parseFloat(lng) },
        radius: parseFloat(radius),
        filters: { category, status, urgent }
      }
    });
  } catch (error) {
    console.error('Get map donations error:', error);
    res.status(500).json({
      error: 'Failed to fetch map data',
      message: 'An error occurred while fetching map data'
    });
  }
});


router.get('/users', [
  query('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
  query('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required'),
  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 100 })
    .withMessage('Radius must be between 0.1 and 100 miles'),
  query('role')
    .optional()
    .isIn(['donor', 'volunteer', 'charity'])
    .withMessage('Invalid role'),
  query('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be true or false')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      lat,
      lng,
      radius = 25,
      role,
      active = true
    } = req.query;

    const coordinates = [parseFloat(lng), parseFloat(lat)];

    // Build query
    const query = {
      isActive: active
    };

    if (role) query.role = role;

    // Find users by location
    const users = await User.find({
      ...query,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: parseFloat(radius) * 1609.34 // Convert miles to meters
        }
      }
    })
    .select('firstName lastName role organization location address')
    .limit(100); // Limit results for map performance

    // Format data for map
    const mapData = users.map(user => ({
      id: user._id,
      type: 'user',
      name: user.fullName,
      role: user.role,
      organization: user.organization,
      coordinates: user.location.coordinates,
      address: user.address
    }));

    res.json({
      success: true,
      data: {
        users: mapData,
        center: { lat: parseFloat(lat), lng: parseFloat(lng) },
        radius: parseFloat(radius),
        filters: { role, active }
      }
    });
  } catch (error) {
    console.error('Get map users error:', error);
    res.status(500).json({
      error: 'Failed to fetch user map data',
      message: 'An error occurred while fetching user map data'
    });
  }
});


router.get('/all', [
  query('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
  query('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required'),
  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 100 })
    .withMessage('Radius must be between 0.1 and 100 miles'),
  query('types')
    .optional()
    .isArray()
    .withMessage('Types must be an array'),
  query('types.*')
    .optional()
    .isIn(['donations', 'users'])
    .withMessage('Invalid type specified')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      lat,
      lng,
      radius = 25,
      types = ['donations', 'users']
    } = req.query;

    const coordinates = [parseFloat(lng), parseFloat(lat)];
    const mapData = {};

    // Get donations if requested
    if (types.includes('donations')) {
      const donations = await Donation.find({
        status: 'available',
        expiryDate: { $gt: new Date() },
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: parseFloat(radius) * 1609.34
          }
        }
      })
      .populate('donor', 'firstName lastName organization')
      .limit(50);

      mapData.donations = donations.map(donation => ({
        id: donation._id,
        type: 'donation',
        title: donation.title,
        category: donation.category,
        isUrgent: donation.isUrgent,
        coordinates: donation.location.coordinates,
        address: donation.location.address,
        pickupDate: donation.pickupDate,
        quantity: donation.quantity,
        expiryDate: donation.expiryDate,
        daysUntilExpiry: donation.daysUntilExpiry,
        donor: donation.donor
      }));
    }

    // Get users if requested
    if (types.includes('users')) {
      const users = await User.find({
        isActive: true,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: parseFloat(radius) * 1609.34
          }
        }
      })
      .select('firstName lastName role organization location address')
      .limit(50);

      mapData.users = users.map(user => ({
        id: user._id,
        type: 'user',
        name: user.fullName,
        role: user.role,
        organization: user.organization,
        coordinates: user.location.coordinates,
        address: user.address
      }));
    }

    res.json({
      success: true,
      data: {
        ...mapData,
        center: { lat: parseFloat(lat), lng: parseFloat(lng) },
        radius: parseFloat(radius),
        types
      }
    });
  } catch (error) {
    console.error('Get all map data error:', error);
    res.status(500).json({
      error: 'Failed to fetch map data',
      message: 'An error occurred while fetching map data'
    });
  }
});


router.get('/stats', [
  query('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
  query('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required'),
  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 100 })
    .withMessage('Radius must be between 0.1 and 100 miles')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { lat, lng, radius = 25 } = req.query;
    const coordinates = [parseFloat(lng), parseFloat(lat)];

    // Get donation statistics
    const donationStats = await Donation.aggregate([
      {
        $match: {
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: coordinates
              },
              $maxDistance: parseFloat(radius) * 1609.34
            }
          },
          expiryDate: { $gt: new Date() }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byCategory: {
            $push: {
              category: '$category',
              count: 1
            }
          },
          byStatus: {
            $push: {
              status: '$status',
              count: 1
            }
          },
          urgent: { $sum: { $cond: ['$isUrgent', 1, 0] } },
          avgQuantity: { $avg: '$quantity.amount' }
        }
      }
    ]);

    // Get user statistics
    const userStats = await User.aggregate([
      {
        $match: {
          isActive: true,
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: coordinates
              },
              $maxDistance: parseFloat(radius) * 1609.34
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byRole: {
            $push: {
              role: '$role',
              count: 1
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        center: { lat: parseFloat(lat), lng: parseFloat(lng) },
        radius: parseFloat(radius),
        donations: donationStats[0] || {},
        users: userStats[0] || {}
      }
    });
  } catch (error) {
    console.error('Get map stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch map statistics',
      message: 'An error occurred while fetching map statistics'
    });
  }
});


router.get('/search', [
  query('q')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Search query must be at least 3 characters long')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { q } = req.query;

    // Search donations by address
    const donations = await Donation.find({
      $or: [
        { 'location.address.street': { $regex: q, $options: 'i' } },
        { 'location.address.city': { $regex: q, $options: 'i' } },
        { 'location.address.state': { $regex: q, $options: 'i' } },
        { 'location.address.zipCode': { $regex: q, $options: 'i' } }
      ],
      status: 'available',
      expiryDate: { $gt: new Date() }
    })
    .populate('donor', 'firstName lastName organization')
    .limit(20);

    // Search users by address
    const users = await User.find({
      $or: [
        { 'address.street': { $regex: q, $options: 'i' } },
        { 'address.city': { $regex: q, $options: 'i' } },
        { 'address.state': { $regex: q, $options: 'i' } },
        { 'address.zipCode': { $regex: q, $options: 'i' } }
      ],
      isActive: true
    })
    .select('firstName lastName role organization address location')
    .limit(20);

    res.json({
      success: true,
      data: {
        query: q,
        donations,
        users,
        total: donations.length + users.length
      }
    });
  } catch (error) {
    console.error('Map search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: 'An error occurred while searching'
    });
  }
});

module.exports = router;
