const Food = require('../models/Food');

// @desc    Delete food listing
// @route   DELETE /api/food/:id
// @access  Private (Owner)
exports.deleteFood = async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) {
            return res.status(404).json({ error: 'Food not found' });
        }

        if (food.donor.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await Food.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Food deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Post food listing
// @route   POST /api/food
// @access  Private (Donor)
exports.postFood = async (req, res) => {
    try {
        if (req.user.role !== 'donor') {
            return res.status(403).json({ error: 'Only donors can post food' });
        }

        const { name, quantity, description, pickupLocation, expiryDate, dietaryTags, contactMethod, imageUrl } = req.body;

        const food = await Food.create({
            donor: req.user.id,
            name,
            quantity,
            description,
            pickupLocation,
            expiryDate,
            dietaryTags,
            contactMethod,
            imageUrl
        });

        res.status(201).json(food);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Get all available food
// @route   GET /api/food
// @access  Public
exports.getAvailableFood = async (req, res) => {
    try {
        const foods = await Food.find({ status: 'available' }).populate('donor', 'firstName lastName organization');
        res.status(200).json(foods);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Get single food listing
// @route   GET /api/food/:id
// @access  Public
exports.getFoodById = async (req, res) => {
    try {
        const food = await Food.findById(req.params.id).populate('donor', 'firstName lastName organization phone email');
        if (!food) {
            return res.status(404).json({ error: 'Food not found' });
        }
        res.status(200).json(food);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Claim food listing
// @route   POST /api/food/claim/:id
// @access  Private (Receiver)
exports.claimFood = async (req, res) => {
    try {
        if (req.user.role !== 'receiver') {
            return res.status(403).json({ error: 'Only receivers can claim food' });
        }

        let food = await Food.findById(req.params.id);

        if (!food) {
            return res.status(404).json({ error: 'Food listing not found' });
        }

        if (food.status === 'claimed') {
            return res.status(400).json({ error: 'Food is already claimed' });
        }

        food.status = 'claimed';
        food.claimedBy = req.user.id;
        await food.save();

        res.status(200).json(food);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Get donor's listings or receiver's claims
// @route   GET /api/food/my
// @access  Private
exports.getMyFood = async (req, res) => {
    try {
        let query;
        if (req.user.role === 'donor') {
            query = { donor: req.user.id };
        } else {
            query = { claimedBy: req.user.id };
        }

        const foods = await Food.find(query).populate('donor', 'firstName lastName organization');
        res.status(200).json(foods);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
