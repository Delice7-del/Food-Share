const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: [true, 'Donation ID is required']
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver ID is required']
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Donor ID is required']
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  message: {
    type: String,
    trim: true,
    maxlength: [200, 'Message cannot exceed 200 characters']
  },
  pickupInstructions: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for quick lookups
requestSchema.index({ donationId: 1, receiverId: 1 }, { unique: true });
requestSchema.index({ donorId: 1, status: 1 });
requestSchema.index({ receiverId: 1, status: 1 });

module.exports = mongoose.model('Request', requestSchema);
