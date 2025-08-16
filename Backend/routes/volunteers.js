const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Volunteer = require('../models/Volunteer');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();


router.get('/', [
  query('role')
    .optional()
    .isIn(['food-collection', 'food-distribution', 'coordination', 'driving', 'sorting', 'admin'])
    .withMessage('Invalid volunteer role'),
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended', 'pending-approval'])
    .withMessage('Invalid status'),
  query('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  query('experience')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid experience level'),
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
      status = 'active',
      skills,
      experience,
      page = 1,
      limit = 20,
      sort = 'rating.average'
    } = req.query;

    // Build query
    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (experience) query.experience = experience;
    if (skills && skills.length > 0) {
      query.skills = { $in: skills };
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    const volunteers = await Volunteer.find(query)
      .sort({ [sort]: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'firstName lastName email phone location organization');

    const total = await Volunteer.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        volunteers,
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
    console.error('Get volunteers error:', error);
    res.status(500).json({
      error: 'Failed to fetch volunteers',
      message: 'An error occurred while fetching volunteers'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id)
      .populate('user', 'firstName lastName email phone location organization')
      .populate('rating.reviews.reviewer', 'firstName lastName');

    if (!volunteer) {
      return res.status(404).json({
        error: 'Volunteer not found',
        message: 'The requested volunteer does not exist'
      });
    }

    res.json({
      success: true,
      data: { volunteer }
    });
  } catch (error) {
    console.error('Get volunteer error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Invalid volunteer ID',
        message: 'The provided volunteer ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to fetch volunteer',
      message: 'An error occurred while fetching the volunteer'
    });
  }
});


router.post('/', protect, [
  body('role')
    .isIn(['food-collection', 'food-distribution', 'coordination', 'driving', 'sorting', 'admin'])
    .withMessage('Invalid volunteer role'),
  body('availability.days')
    .isArray({ min: 1 })
    .withMessage('At least one availability day is required'),
  body('availability.days.*')
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day of week'),
  body('availability.timeSlots')
    .optional()
    .isArray()
    .withMessage('Time slots must be an array'),
  body('availability.timeSlots.*.start')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid start time format (HH:MM)'),
  body('availability.timeSlots.*.end')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid end time format (HH:MM)'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('skills.*')
    .optional()
    .isIn(['driving', 'lifting', 'cooking', 'organization', 'communication', 'first-aid', 'food-safety', 'logistics', 'customer-service', 'multilingual'])
    .withMessage('Invalid skill'),
  body('experience')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid experience level'),
  body('vehicle.hasVehicle')
    .optional()
    .isBoolean()
    .withMessage('Vehicle availability must be boolean'),
  body('vehicle.type')
    .optional()
    .isIn(['car', 'van', 'truck', 'motorcycle', 'bicycle'])
    .withMessage('Invalid vehicle type'),
  body('preferences.maxDistance')
    .optional()
    .isFloat({ min: 1, max: 100 })
    .withMessage('Max distance must be between 1 and 100 miles'),
  body('preferences.maxDuration')
    .optional()
    .isFloat({ min: 1, max: 12 })
    .withMessage('Max duration must be between 1 and 12 hours'),
  body('emergencyContact.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Emergency contact name must be between 2 and 100 characters'),
  body('emergencyContact.phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Invalid emergency contact phone number')
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

    // Check if user is already a volunteer
    const existingVolunteer = await Volunteer.findOne({ user: req.user._id });
    if (existingVolunteer) {
      return res.status(400).json({
        error: 'Already a volunteer',
        message: 'You are already registered as a volunteer'
      });
    }

    // Create volunteer profile
    const volunteerData = {
      ...req.body,
      user: req.user._id
    };

    const volunteer = await Volunteer.create(volunteerData);

    // Populate user info
    await volunteer.populate('user', 'firstName lastName email phone location organization');

    res.status(201).json({
      success: true,
      message: 'Volunteer profile created successfully',
      data: { volunteer }
    });
  } catch (error) {
    console.error('Create volunteer error:', error);
    res.status(500).json({
      error: 'Failed to create volunteer profile',
      message: 'An error occurred while creating the volunteer profile'
    });
  }
});


router.put('/:id', protect, async (req, res) => {
  try {
    // Find volunteer and check ownership
    const volunteer = await Volunteer.findById(req.params.id);
    
    if (!volunteer) {
      return res.status(404).json({
        error: 'Volunteer not found',
        message: 'The requested volunteer profile does not exist'
      });
    }

    if (volunteer.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own volunteer profile'
      });
    }

    // Update volunteer profile
    const updatedVolunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email phone location organization');

    res.json({
      success: true,
      message: 'Volunteer profile updated successfully',
      data: { volunteer: updatedVolunteer }
    });
  } catch (error) {
    console.error('Update volunteer error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Invalid volunteer ID',
        message: 'The provided volunteer ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to update volunteer profile',
      message: 'An error occurred while updating the volunteer profile'
    });
  }
});


router.post('/:id/rate', protect, [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
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

    const { rating, comment } = req.body;

    // Find volunteer
    const volunteer = await Volunteer.findById(req.params.id);
    
    if (!volunteer) {
      return res.status(404).json({
        error: 'Volunteer not found',
        message: 'The requested volunteer profile does not exist'
      });
    }

    // Check if user is rating themselves
    if (volunteer.user.toString() === req.user._id.toString()) {
      return res.status(400).json({
        error: 'Cannot rate yourself',
        message: 'You cannot rate your own volunteer profile'
      });
    }

    // Update rating
    await volunteer.updateRating(rating, req.user._id, comment);

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: { 
        volunteer: {
          id: volunteer._id,
          rating: volunteer.rating
        }
      }
    });
  } catch (error) {
    console.error('Rate volunteer error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Invalid volunteer ID',
        message: 'The provided volunteer ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to submit rating',
      message: 'An error occurred while submitting the rating'
    });
  }
});


router.get('/available/:role/:day', [
  query('startTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  query('endTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  query('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  query('maxDistance')
    .optional()
    .isFloat({ min: 1, max: 100 })
    .withMessage('Max distance must be between 1 and 100 miles')
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

    const { role, day } = req.params;
    const { startTime, endTime, skills, maxDistance } = req.query;

    // Find available volunteers
    let volunteers = await Volunteer.findAvailable(role, day, startTime, endTime);

    // Filter by skills if specified
    if (skills && skills.length > 0) {
      volunteers = volunteers.filter(volunteer => 
        skills.some(skill => volunteer.skills.includes(skill))
      );
    }

    // Filter by distance if specified
    if (maxDistance && req.user?.location) {
      volunteers = volunteers.filter(volunteer => {
        const volunteerDistance = volunteer.user.preferences?.maxDistance || 25;
        return volunteerDistance <= parseFloat(maxDistance);
      });
    }

    res.json({
      success: true,
      data: { 
        volunteers,
        filters: { role, day, startTime, endTime, skills, maxDistance }
      }
    });
  } catch (error) {
    console.error('Find available volunteers error:', error);
    res.status(500).json({
      error: 'Failed to find available volunteers',
      message: 'An error occurred while searching for available volunteers'
    });
  }
});


router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Volunteer.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending-approval'] }, 1, 0] } },
          byRole: {
            $push: {
              role: '$role',
              count: 1
            }
          },
          avgRating: { $avg: '$rating.average' }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          active: 1,
          pending: 1,
          avgRating: { $round: ['$avgRating', 2] },
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
    console.error('Get volunteer stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch volunteer statistics',
      message: 'An error occurred while fetching volunteer statistics'
    });
  }
});

module.exports = router;
