const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Contact = require('../models/Contact');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();


router.post('/', [
  body('firstName')
    .trim(),
  body('lastName')
    .trim(),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .matches(/^[\+]?[\d\s\-\(\)\.]{5,20}$/)
    .withMessage('Please provide a valid phone number (min 5 digits)'),
  body('subject')
    .trim(),
  body('message')
    .trim(),
  body('category')
    .optional()
    .isIn(['general', 'donation', 'volunteer', 'partnership', 'support', 'feedback', 'other'])
    .withMessage('Invalid category'),
  body('source')
    .optional()
    .isIn(['website', 'mobile-app', 'email', 'phone', 'social-media'])
    .withMessage('Invalid source')
], async (req, res) => {
  console.log('Received contact submission:', req.body);
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const contactData = {
      ...req.body,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress
    };

    // Create contact
    const contact = await Contact.create(contactData);

    res.status(201).json({
      success: true,
      message: 'Message submitted successfully',
      data: {
        contact: {
          id: contact._id,
          subject: contact.subject,
          category: contact.category,
          status: contact.status
        }
      }
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({
      error: 'Failed to submit message',
      message: 'An error occurred while submitting your message'
    });
  }
});


router.get('/', protect, authorize('admin'), [
  query('status')
    .optional()
    .isIn(['new', 'in-progress', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  query('category')
    .optional()
    .isIn(['general', 'donation', 'volunteer', 'partnership', 'support', 'feedback', 'other'])
    .withMessage('Invalid category'),
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
      status,
      priority,
      category,
      page = 1,
      limit = 20,
      sort = 'createdAt'
    } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    const contacts = await Contact.find(query)
      .sort({ [sort]: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('assignedTo', 'firstName lastName email');

    const total = await Contact.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        contacts,
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
    console.error('Get contacts error:', error);
    res.status(500).json({
      error: 'Failed to fetch contacts',
      message: 'An error occurred while fetching contacts'
    });
  }
});


router.get('/:id', protect, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('response.respondedBy', 'firstName lastName email');

    if (!contact) {
      return res.status(404).json({
        error: 'Contact not found',
        message: 'The requested contact does not exist'
      });
    }

    // Check if user can access this contact
    if (req.user.role !== 'admin' &&
      (!contact.assignedTo || contact.assignedTo._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view contacts assigned to you'
      });
    }

    res.json({
      success: true,
      data: { contact }
    });
  } catch (error) {
    console.error('Get contact error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Invalid contact ID',
        message: 'The provided contact ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to fetch contact',
      message: 'An error occurred while fetching the contact'
    });
  }
});


router.post('/:id/respond', protect, [
  body('message')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Response message must be between 5 and 1000 characters')
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

    const { message } = req.body;

    // Find contact
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        error: 'Contact not found',
        message: 'The requested contact does not exist'
      });
    }

    // Check if user can respond to this contact
    if (req.user.role !== 'admin' &&
      (!contact.assignedTo || contact.assignedTo.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only respond to contacts assigned to you'
      });
    }

    await contact.respond(message, req.user._id);

    await contact.populate('assignedTo', 'firstName lastName email');
    await contact.populate('response.respondedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Response sent successfully',
      data: { contact }
    });
  } catch (error) {
    console.error('Respond to contact error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Invalid contact ID',
        message: 'The provided contact ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to send response',
      message: 'An error occurred while sending the response'
    });
  }
});


router.post('/:id/assign', protect, authorize('admin'), [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required')
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

    const { userId } = req.body;

    // Find contact
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        error: 'Contact not found',
        message: 'The requested contact does not exist'
      });
    }

    // Assign contact
    await contact.assignTo(userId);

    // Populate updated contact
    await contact.populate('assignedTo', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Contact assigned successfully',
      data: { contact }
    });
  } catch (error) {
    console.error('Assign contact error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Invalid contact ID',
        message: 'The provided contact ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to assign contact',
      message: 'An error occurred while assigning the contact'
    });
  }
});


router.post('/:id/notes', protect, [
  body('content')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Note content must be between 5 and 500 characters')
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

    const { content } = req.body;

    // Find contact
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        error: 'Contact not found',
        message: 'The requested contact does not exist'
      });
    }

    // Check if user can add notes to this contact
    if (req.user.role !== 'admin' &&
      (!contact.assignedTo || contact.assignedTo.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only add notes to contacts assigned to you'
      });
    }

    // Add note
    await contact.addNote(content, req.user._id);

    res.json({
      success: true,
      message: 'Note added successfully',
      data: {
        contact: {
          id: contact._id,
          notes: contact.notes
        }
      }
    });
  } catch (error) {
    console.error('Add note error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Invalid contact ID',
        message: 'The provided contact ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to add note',
      message: 'An error occurred while adding the note'
    });
  }
});

// @desc    Schedule follow-up
// @route   POST /api/contact/:id/follow-up
// @access  Private (admin or assigned user)
router.post('/:id/follow-up', protect, [
  body('date')
    .isISO8601()
    .withMessage('Valid follow-up date is required'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Follow-up notes cannot exceed 500 characters')
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

    const { date, notes } = req.body;

    // Find contact
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        error: 'Contact not found',
        message: 'The requested contact does not exist'
      });
    }

    // Check if user can schedule follow-up for this contact
    if (req.user.role !== 'admin' &&
      (!contact.assignedTo || contact.assignedTo.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only schedule follow-ups for contacts assigned to you'
      });
    }

    // Schedule follow-up
    await contact.scheduleFollowUp(new Date(date), notes);

    res.json({
      success: true,
      message: 'Follow-up scheduled successfully',
      data: {
        contact: {
          id: contact._id,
          followUp: contact.followUp
        }
      }
    });
  } catch (error) {
    console.error('Schedule follow-up error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        error: 'Invalid contact ID',
        message: 'The provided contact ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to schedule follow-up',
      message: 'An error occurred while scheduling the follow-up'
    });
  }
});


router.get('/urgent', protect, authorize('admin'), async (req, res) => {
  try {
    const contacts = await Contact.findUrgent();

    res.json({
      success: true,
      data: { contacts }
    });
  } catch (error) {
    console.error('Get urgent contacts error:', error);
    res.status(500).json({
      error: 'Failed to fetch urgent contacts',
      message: 'An error occurred while fetching urgent contacts'
    });
  }
});


router.get('/stats/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = await Contact.getStatistics();

    res.json({
      success: true,
      data: { stats: stats[0] || {} }
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch contact statistics',
      message: 'An error occurred while fetching contact statistics'
    });
  }
});

module.exports = router;
