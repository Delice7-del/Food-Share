const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Message = require('../models/Message');
const Request = require('../models/Request');

router.use(protect);

// @route   GET /api/messages/:requestId
// @desc    Get messages for a specific request
router.get('/:requestId', async (req, res) => {
  try {
    const messages = await Message.find({ request: req.params.requestId })
      .sort({ createdAt: 1 })
      .populate('sender', 'firstName lastName');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/messages
// @desc    Send a message
router.post('/', async (req, res) => {
  const { requestId, text } = req.body;
  try {
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    // Ensure user is either the donor or the receiver
    if (request.donorId.toString() !== req.user.id && request.receiverId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const message = await Message.create({
      request: requestId,
      sender: req.user.id,
      text
    });

    // Notify the other party
    const recipient = request.donorId.toString() === req.user.id ? request.receiverId : request.donorId;
    const Notification = require('../models/Notification');
    await Notification.create({
      recipient,
      type: 'request_received', // Using existing type for simplicity
      title: 'New Message',
      message: `${req.user.firstName} sent you a message.`,
      link: `/chat/${requestId}`
    });

    const populatedMessage = await message.populate('sender', 'firstName lastName');
    
    // Real-time chat message
    const io = req.app.get('io');
    if (io) {
      io.to(recipient.toString()).emit('new_message', {
        requestId,
        message: populatedMessage
      });
      
      // Also send a general notification
      io.to(recipient.toString()).emit('notification', {
        title: 'New Message',
        message: `${req.user.firstName} sent you a message.`,
        type: 'chat_message'
      });
    }

    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
