const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Donor is required']
    },
    name: {
        type: String,
        required: [true, 'Food name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    quantity: {
        type: String,
        required: [true, 'Quantity is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    pickupLocation: {
        type: String,
        required: [true, 'Pickup location is required']
    },
    expiryDate: {
        type: Date,
        required: [true, 'Expiry date is required']
    },
    dietaryTags: {
        type: [String],
        default: []
    },
    contactMethod: {
        type: String,
        required: [true, 'Contact method is required'],
        default: 'In-app'
    },
    imageUrl: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['available', 'claimed'],
        default: 'available'
    },
    claimedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Food', foodSchema);
