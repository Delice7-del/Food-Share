const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();


router.get('/', protect, authorize('admin'), [
  query('role')
    .optional()
    .isIn(['donor', 'volunteer', 'charity', 'admin'])
    .withMessage('Invalid role'),
  query('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status'),
  query('verified')
    .optional()
    .isBoolean()
    .withMessage('Verified must be true or false'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
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
      role,
      status,
      verified,
      page = 1,
      limit = 20,
      sort = 'createdAt'
    } = req.query;

    // Build query
    const query = {};
    if (role) query.role = role;
    if (status) query.isActive = status === 'active';
    if (verified !== undefined) query.isVerified = verified === 'true';

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ [sort]: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: 'An error occurred while fetching users'
    });
  }
});


router.get('/:id', protect, async (req, res) => {
  try {
    // Check if user can access this profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view your own profile'
      });
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Invalid user ID',
        message: 'The provided user ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to fetch user',
      message: 'An error occurred while fetching the user'
    });
  }
});


router.put('/:id', protect, [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('organization')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Organization name cannot exceed 100 characters'),
  body('role')
    .optional()
    .isIn(['donor', 'volunteer', 'charity', 'admin'])
    .withMessage('Invalid role'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Active status must be boolean'),
  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('Verification status must be boolean')
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

    // Check if user can update this profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own profile'
      });
    }

    // Only admins can change role, active status, and verification status
    if (req.user.role !== 'admin') {
      delete req.body.role;
      delete req.body.isActive;
      delete req.body.isVerified;
    }

    // Find user and update
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Invalid user ID',
        message: 'The provided user ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to update user',
      message: 'An error occurred while updating the user'
    });
  }
});


router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        error: 'Cannot delete yourself',
        message: 'You cannot delete your own account'
      });
    }

    // Soft delete - mark as inactive instead of removing
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Invalid user ID',
        message: 'The provided user ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to deactivate user',
      message: 'An error occurred while deactivating the user'
    });
  }
});


router.get('/nearby', [
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
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
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
      limit = 50
    } = req.query;

    const coordinates = [parseFloat(lng), parseFloat(lat)];

    // Build query
    const query = {
      isActive: true
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
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        users,
        center: { lat: parseFloat(lat), lng: parseFloat(lng) },
        radius: parseFloat(radius),
        filters: { role }
      }
    });
  } catch (error) {
    console.error('Get nearby users error:', error);
    res.status(500).json({
      error: 'Failed to fetch nearby users',
      message: 'An error occurred while fetching nearby users'
    });
  }
});


router.get('/stats/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          verified: { $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] } },
          byRole: {
            $push: {
              role: '$role',
              count: 1
            }
          },
          avgLastLogin: { $avg: '$lastLogin' }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          active: 1,
          verified: 1,
          avgLastLogin: 1,
          byRole: {
            $reduce: {
              input: '$byRole',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $literal: {
                      $concat: ['$$this.role', ': ', { $toString: '$$this.count' }]
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: { stats: stats[0] || {} }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch user statistics',
      message: 'An error occurred while fetching user statistics'
    });
  }
});


router.get('/search', protect, authorize('admin'), [
  query('q')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters long')
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

    // Search users by name, email, or organization
    const users = await User.find({
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { organization: { $regex: q, $options: 'i' } }
      ]
    })
    .select('-password')
    .limit(20);

    res.json({
      success: true,
      data: {
        query: q,
        users,
        total: users.length
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: 'An error occurred while searching'
    });
  }
});

module.exports = router;
