const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Donation = require('../models/Donation');
const User = require('../models/User');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, [
  query('category')
    .optional()
    .isIn(['fruits', 'vegetables', 'grains', 'dairy', 'meat', 'canned', 'baked', 'frozen', 'beverages', 'snacks', 'other'])
    .withMessage('Invalid category'),
  query('status')
    .optional()
    .isIn(['available', 'reserved', 'picked-up', 'expired', 'cancelled'])
    .withMessage('Invalid status'),
  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 100 })
    .withMessage('Radius must be between 0.1 and 100 miles'),
  query('urgent')
    .optional()
    .isBoolean()
    .withMessage('Urgent must be true or false'),
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
      category,
      status = 'available',
      lat,
      lng,
      radius = 25,
      urgent,
      page = 1,
      limit = 20,
      sort = 'createdAt'
    } = req.query;

    // Build query
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (urgent !== undefined) query.isUrgent = urgent === 'true';

    // Add expiry date filter for available donations
    if (status === 'available') {
      query.expiryDate = { $gt: new Date() };
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    let donations;
    let total;

    // If coordinates provided, use geospatial query
    if (lat && lng) {
      const coordinates = [parseFloat(lng), parseFloat(lat)];
      
      donations = await Donation.findNearby(coordinates, parseFloat(radius), { category })
        .sort({ [sort]: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('donor', 'firstName lastName organization');

      // Get total count for pagination
      total = await Donation.countDocuments({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: parseFloat(radius) * 1609.34
          }
        }
      });
    } else {
      // Regular query without geospatial
      donations = await Donation.find(query)
        .sort({ [sort]: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('donor', 'firstName lastName organization');

      total = await Donation.countDocuments(query);
    }

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        donations,
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
    console.error('Get donations error:', error);
    res.status(500).json({
      error: 'Failed to fetch donations',
      message: 'An error occurred while fetching donations'
    });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'firstName lastName organization phone email')
      .populate('reservedBy.volunteer', 'firstName lastName phone email')
      .populate('reservedBy.charity', 'firstName lastName organization phone email');

    if (!donation) {
      return res.status(404).json({
        error: 'Donation not found',
        message: 'The requested donation does not exist'
      });
    }

    // Increment view count
    await donation.incrementViews();

    res.json({
      success: true,
      data: { donation }
    });
  } catch (error) {
    console.error('Get donation error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Invalid donation ID',
        message: 'The provided donation ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to fetch donation',
      message: 'An error occurred while fetching the donation'
    });
  }
});


router.post('/', [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .isIn(['fruits', 'vegetables', 'grains', 'dairy', 'meat', 'canned', 'baked', 'frozen', 'beverages', 'snacks', 'other'])
    .withMessage('Invalid food category'),
  body('quantity.amount')
    .isFloat({ min: 0.1 })
    .withMessage('Quantity amount must be greater than 0'),
  body('quantity.unit')
    .isIn(['kg', 'lbs', 'pieces', 'cans', 'boxes', 'bottles', 'bags'])
    .withMessage('Invalid quantity unit'),
  body('expiryDate')
    .isISO8601()
    .withMessage('Invalid expiry date format'),
  body('pickupDate')
    .isISO8601()
    .withMessage('Invalid pickup date format'),
  body('pickupTime.start')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid pickup start time format (HH:MM)'),
  body('pickupTime.end')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid pickup end time format (HH:MM)'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates must be an array of 2 numbers [longitude, latitude]'),
  body('location.coordinates.*')
    .isFloat()
    .withMessage('Coordinates must be valid numbers'),
  body('dietary.*')
    .optional()
    .isBoolean()
    .withMessage('Dietary restrictions must be boolean values'),
  body('storage.temperature')
    .optional()
    .isIn(['room', 'refrigerated', 'frozen'])
    .withMessage('Invalid storage temperature'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each tag must be a string with maximum 50 characters')
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

    const donationData = {
      ...req.body
    };

    // Validate pickup date is not in the past
    if (new Date(req.body.pickupDate) < new Date()) {
      return res.status(400).json({
        error: 'Invalid pickup date',
        message: 'Pickup date cannot be in the past'
      });
    }

    // Validate expiry date is after pickup date
    if (new Date(req.body.expiryDate) <= new Date(req.body.pickupDate)) {
      return res.status(400).json({
        error: 'Invalid expiry date',
        message: 'Expiry date must be after pickup date'
      });
    }

    // Create donation
    const donation = await Donation.create(donationData);

    // Populate donor info if available
    if (donation.donor) {
      await donation.populate('donor', 'firstName lastName organization');
    }

    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      data: { donation }
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({
      error: 'Failed to create donation',
      message: 'An error occurred while creating the donation'
    });
  }
});


router.put('/:id', protect, authorize('donor'), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('pickupDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid pickup date format'),
  body('pickupTime.start')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid pickup start time format (HH:MM)'),
  body('pickupTime.end')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid pickup end time format (HH:MM)')
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

    // Find donation and check ownership
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({
        error: 'Donation not found',
        message: 'The requested donation does not exist'
      });
    }

    if (donation.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own donations'
      });
    }

    // Check if donation can be updated
    if (donation.status === 'picked-up' || donation.status === 'expired') {
      return res.status(400).json({
        error: 'Cannot update donation',
        message: 'This donation cannot be updated in its current status'
      });
    }

    // Update donation
    const updatedDonation = await Donation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('donor', 'firstName lastName organization');

    res.json({
      success: true,
      message: 'Donation updated successfully',
      data: { donation: updatedDonation }
    });
  } catch (error) {
    console.error('Update donation error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Invalid donation ID',
        message: 'The provided donation ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to update donation',
      message: 'An error occurred while updating the donation'
    });
  }
});


router.post('/:id/reserve', protect, authorize('volunteer', 'charity'), [
  body('pickupNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Pickup notes cannot exceed 500 characters')
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

    const { pickupNotes } = req.body;

    // Find donation
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({
        error: 'Donation not found',
        message: 'The requested donation does not exist'
      });
    }

    // Check if donation is available
    if (donation.status !== 'available') {
      return res.status(400).json({
        error: 'Donation not available',
        message: 'This donation is not available for reservation'
      });
    }

    // Check if donation has expired
    if (new Date(donation.expiryDate) <= new Date()) {
      return res.status(400).json({
        error: 'Donation expired',
        message: 'This donation has expired and cannot be reserved'
      });
    }

    // Reserve donation
    const userType = req.user.role === 'volunteer' ? 'volunteer' : 'charity';
    await donation.reserve(req.user._id, userType, pickupNotes);

    // Populate updated donation
    await donation.populate('donor', 'firstName lastName organization');
    await donation.populate(`reservedBy.${userType}`, 'firstName lastName organization phone email');

    res.json({
      success: true,
      message: 'Donation reserved successfully',
      data: { donation }
    });
  } catch (error) {
    console.error('Reserve donation error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Invalid donation ID',
        message: 'The provided donation ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to reserve donation',
      message: 'An error occurred while reserving the donation'
    });
  }
});


router.post('/:id/cancel-reservation', protect, async (req, res) => {
  try {
    // Find donation
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({
        error: 'Donation not found',
        message: 'The requested donation does not exist'
      });
    }

    // Check if user is the one who reserved it
    const userType = req.user.role === 'volunteer' ? 'volunteer' : 'charity';
    if (!donation.reservedBy || donation.reservedBy[userType]?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only cancel your own reservations'
      });
    }

    // Cancel reservation
    await donation.cancelReservation();

    res.json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: { donation }
    });
  } catch (error) {
    console.error('Cancel reservation error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Invalid donation ID',
        message: 'The provided donation ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to cancel reservation',
      message: 'An error occurred while cancelling the reservation'
    });
  }
});


router.post('/:id/pickup', protect, async (req, res) => {
  try {
    // Find donation
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({
        error: 'Donation not found',
        message: 'The requested donation does not exist'
      });
    }

    // Check if user is the one who reserved it
    const userType = req.user.role === 'volunteer' ? 'volunteer' : 'charity';
    if (!donation.reservedBy || donation.reservedBy[userType]?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only mark your own reservations as picked up'
      });
    }

    // Check if donation is reserved
    if (donation.status !== 'reserved') {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'This donation is not reserved'
      });
    }

    // Mark as picked up
    await donation.markPickedUp();

    res.json({
      success: true,
      message: 'Donation marked as picked up successfully',
      data: { donation }
    });
  } catch (error) {
    console.error('Mark pickup error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Invalid donation ID',
        message: 'The provided donation ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to mark pickup',
      message: 'An error occurred while marking the donation as picked up'
    });
  }
});


router.delete('/:id', protect, authorize('donor'), async (req, res) => {
  try {
    // Find donation and check ownership
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({
        error: 'Donation not found',
        message: 'The requested donation does not exist'
      });
    }

    if (donation.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own donations'
      });
    }

    // Check if donation can be deleted
    if (donation.status === 'reserved' || donation.status === 'picked-up') {
      return res.status(400).json({
        error: 'Cannot delete donation',
        message: 'This donation cannot be deleted in its current status'
      });
    }

    // Delete donation
    await Donation.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Donation deleted successfully'
    });
  } catch (error) {
    console.error('Delete donation error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Invalid donation ID',
        message: 'The provided donation ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to delete donation',
      message: 'An error occurred while deleting the donation'
    });
  }
});


router.get('/expiring-soon/:days?', async (req, res) => {
  try {
    const days = parseInt(req.params.days) || 3;
    
    if (days < 1 || days > 30) {
      return res.status(400).json({
        error: 'Invalid days parameter',
        message: 'Days must be between 1 and 30'
      });
    }

    const donations = await Donation.findExpiringSoon(days);

    res.json({
      success: true,
      data: { 
        donations,
        daysUntilExpiry: days
      }
    });
  } catch (error) {
    console.error('Get expiring donations error:', error);
    res.status(500).json({
      error: 'Failed to fetch expiring donations',
      message: 'An error occurred while fetching expiring donations'
    });
  }
});

module.exports = router;
