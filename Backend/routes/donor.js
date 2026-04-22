const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Donation = require('../models/Donation');
const Request = require('../models/Request');

// All routes here require donor role
router.use(protect);
router.use(authorize('donor'));

// @route   GET /api/donor/stats
// @desc    Get donor dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const activeDonations = await Donation.countDocuments({ 
      donor: req.user._id, 
      status: 'available' 
    });
    const pendingRequests = await Request.countDocuments({ 
      donorId: req.user._id, 
      status: 'Pending' 
    });
    const completedDonations = await Donation.countDocuments({ 
      donor: req.user._id, 
      status: 'picked-up' 
    });

    res.json({
      activeDonations,
      pendingRequests,
      completedDonations
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/donor/donations/recent
// @desc    Get recent donations for dashboard
router.get('/donations/recent', async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/donor/requests
// @desc    Get incoming requests for donor
router.get('/requests', async (req, res) => {
  try {
    const requests = await Request.find({ donorId: req.user._id })
      .populate('donationId')
      .populate('receiverId', 'firstName lastName organization')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PATCH /api/donor/requests/:id
// @desc    Accept or reject a request
router.patch('/requests/:id', async (req, res) => {
  const { status, pickupInstructions } = req.body;
  try {
    const request = await Request.findOne({ _id: req.id, donorId: req.user._id });
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = status;
    if (pickupInstructions) request.pickupInstructions = pickupInstructions;
    await request.save();

    // If accepted, update donation status
    if (status === 'Accepted') {
      await Donation.findByIdAndUpdate(request.donationId, { status: 'reserved' });
    }

    // Create notification for receiver
    const Notification = require('../models/Notification');
    await Notification.create({
      recipient: request.receiverId,
      type: status === 'Accepted' ? 'request_accepted' : 'request_rejected',
      title: `Request ${status}`,
      message: `Your request for "${request.donationId.title}" has been ${status.toLowerCase()}.`,
      link: '/receiver/dashboard'
    });

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
