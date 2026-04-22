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
    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });
    if (donation.status !== 'available') return res.status(400).json({ error: 'Food is no longer available' });

    // Check if already requested
    const existing = await Request.findOne({ donationId, receiverId: req.user._id });
    if (existing) return res.status(400).json({ error: 'You have already requested this item' });

    const request = await Request.create({
      donationId,
      receiverId: req.user._id,
      donorId: donation.donor,
      message,
      status: 'Pending'
    });

    // Create notification for donor
    const Notification = require('../models/Notification');
    await Notification.create({
      recipient: donation.donor,
      type: 'request_received',
      title: 'New Request Received',
      message: `${req.user.firstName} has requested your donation: "${donation.title}".`,
      link: '/donor/requests'
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
