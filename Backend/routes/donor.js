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
    const Food = require('../models/Food');
    const Donation = require('../models/Donation');
    const Request = require('../models/Request');

    // Count Active Donations (Available in both models)
    const activeDonationsCount = await Donation.countDocuments({ 
      donor: req.user._id, 
      status: 'available' 
    });
    const activeFoodCount = await Food.countDocuments({ 
      donor: req.user._id, 
      status: 'available' 
    });

    // Count Pending Requests
    const pendingRequests = await Request.countDocuments({ 
      donorId: req.user._id, 
      status: 'Pending' 
    });

    // Count Completed/Claimed Donations
    const pickedUpDonations = await Donation.countDocuments({ 
      donor: req.user._id, 
      status: 'picked-up' 
    });
    const claimedFood = await Food.countDocuments({ 
      donor: req.user._id, 
      status: 'claimed' 
    });

    res.json({
      activeDonations: activeDonationsCount + activeFoodCount,
      pendingRequests,
      completedDonations: pickedUpDonations + claimedFood
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/donor/donations/recent
// @desc    Get recent donations for dashboard
router.get('/donations/recent', async (req, res) => {
  try {
    const Food = require('../models/Food');
    const [donations, foods] = await Promise.all([
      Donation.find({ donor: req.user._id }).sort({ createdAt: -1 }).limit(5),
      Food.find({ donor: req.user._id }).sort({ createdAt: -1 }).limit(5)
    ]);

    // Combine and sort by createdAt descending
    const combined = [...donations, ...foods]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    res.json(combined);
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
    const request = await Request.findOne({ _id: req.params.id, donorId: req.user._id })
      .populate('donationId');
      
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = status;
    if (pickupInstructions) request.pickupInstructions = pickupInstructions;
    await request.save();

    // If accepted, update donation status
    if (status === 'Accepted') {
      // Find and update the donation (either Food or Donation model)
      const DonationModel = require('../models/Donation');
      const FoodModel = require('../models/Food');
      
      await DonationModel.findByIdAndUpdate(request.donationId, { status: 'reserved' });
      await FoodModel.findByIdAndUpdate(request.donationId, { status: 'claimed' });
    }

    // Create notification for receiver
    const Notification = require('../models/Notification');
    const notificationData = {
      recipient: request.receiverId,
      type: status === 'Accepted' ? 'request_accepted' : 'request_rejected',
      title: `Request ${status}`,
      message: `Your request for "${request.donationId?.title || request.donationId?.name || 'Food Item'}" has been ${status.toLowerCase()}.`,
      link: '/receiver/dashboard'
    };
    await Notification.create(notificationData);

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(request.receiverId.toString()).emit('notification', {
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type
      });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
