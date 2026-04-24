const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Request = require('../models/Request');
const Donation = require('../models/Donation');

// All routes here require receiver role
router.use(protect);
router.use(authorize('receiver'));

// @route   GET /api/receiver/requests
// @desc    Get receiver's requests
router.get('/requests', async (req, res) => {
  try {
    const requests = await Request.find({ receiverId: req.user._id })
      .populate('donationId')
      .populate('donorId', 'firstName lastName organization')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/receiver/requests
// @desc    Create a new request for food
router.post('/requests', async (req, res) => {
  const { donationId, message } = req.body;
  try {
    const food = await Donation.findById(donationId);
    if (!food) return res.status(404).json({ error: 'Donation not found' });
    if (food.status !== 'available') return res.status(400).json({ error: 'Food is no longer available' });

    // Check if already requested
    const existing = await Request.findOne({ donationId, receiverId: req.user._id });
    if (existing) return res.status(400).json({ error: 'You have already requested this item' });

    const request = await Request.create({
      donationId,
      receiverId: req.user._id,
      donorId: food.donor,
      message,
      status: 'Pending'
    });

    // Create notification for donor
    const Notification = require('../models/Notification');
    const notificationData = {
      recipient: food.donor,
      type: 'request_received',
      title: 'New Request Received',
      message: `${req.user.firstName} has requested your donation: "${food.title || food.name}".`,
      link: '/donor/requests'
    };
    await Notification.create(notificationData);

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(food.donor.toString()).emit('notification', {
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type
      });
    }

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
