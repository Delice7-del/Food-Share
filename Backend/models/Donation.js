const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Donor is required']
  },
  title: {
    type: String,
    required: [true, 'Donation title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Food category is required'],
    enum: [
      'fruits',
      'vegetables',
      'grains',
      'dairy',
      'meat',
      'canned',
      'baked',
      'frozen',
      'beverages',
      'snacks',
      'other'
    ]
  },
  quantity: {
    amount: {
      type: Number,
      required: [true, 'Quantity amount is required'],
      min: [0.1, 'Quantity must be greater than 0']
    },
    unit: {
      type: String,
      required: [true, 'Quantity unit is required'],
      enum: ['kg', 'lbs', 'pieces', 'cans', 'boxes', 'bottles', 'bags']
    }
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  pickupDate: {
    type: Date,
    required: [true, 'Pickup date is required']
  },
  pickupTime: {
    start: {
      type: String,
      required: [true, 'Pickup start time is required'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)']
    },
    end: {
      type: String,
      required: [true, 'Pickup end time is required'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)']
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'United States'
      }
    }
  },
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['available', 'reserved', 'picked-up', 'expired', 'cancelled'],
    default: 'available'
  },
  reservedBy: {
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    charity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reservedAt: Date,
    pickupNotes: String
  },
  dietary: {
    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false },
    isNutFree: { type: Boolean, default: false },
    isHalal: { type: Boolean, default: false },
    isKosher: { type: Boolean, default: false }
  },
  storage: {
    temperature: {
      type: String,
      enum: ['room', 'refrigerated', 'frozen'],
      default: 'room'
    },
    specialInstructions: String
  },
  tags: [String],
  isUrgent: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  contactPreference: {
    type: String,
    enum: ['email', 'phone', 'both'],
    default: 'email'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
donationSchema.index({ location: '2dsphere' });
donationSchema.index({ status: 1, expiryDate: 1 });
donationSchema.index({ donor: 1, createdAt: -1 });
donationSchema.index({ category: 1, status: 1 });

// Virtual for days until expiry
donationSchema.virtual('daysUntilExpiry').get(function() {
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for expiry status
donationSchema.virtual('expiryStatus').get(function() {
  const days = this.daysUntilExpiry;
  if (days < 0) return 'expired';
  if (days <= 1) return 'expiring-soon';
  if (days <= 3) return 'expiring-this-week';
  return 'good';
});

// Virtual for pickup address string
donationSchema.virtual('pickupAddressString').get(function() {
  if (!this.location.address.street) return '';
  return `${this.location.address.street}, ${this.location.address.city}, ${this.location.address.state} ${this.location.address.zipCode}`;
});

// Pre-save middleware to set urgent flag
donationSchema.pre('save', function(next) {
  if (this.daysUntilExpiry <= 1) {
    this.isUrgent = true;
  }
  next();
});

// Static method to find donations by location
donationSchema.statics.findNearby = function(coordinates, maxDistance = 25, filters = {}) {
  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance * 1609.34 // Convert miles to meters
      }
    },
    status: 'available',
    expiryDate: { $gt: new Date() }
  };

  // Add additional filters
  if (filters.category) query.category = filters.category;
  if (filters.dietary) {
    Object.keys(filters.dietary).forEach(key => {
      if (filters.dietary[key]) query[`dietary.${key}`] = true;
    });
  }

  return this.find(query).populate('donor', 'firstName lastName organization');
};

// Static method to find expiring soon donations
donationSchema.statics.findExpiringSoon = function(days = 3) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    status: 'available',
    expiryDate: { $lte: futureDate, $gt: new Date() }
  }).populate('donor', 'firstName lastName organization');
};

// Method to increment views
donationSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to reserve donation
donationSchema.methods.reserve = function(userId, userType, notes = '') {
  this.status = 'reserved';
  this.reservedBy = {
    [userType]: userId,
    reservedAt: new Date(),
    pickupNotes: notes
  };
  return this.save();
};

// Method to cancel reservation
donationSchema.methods.cancelReservation = function() {
  this.status = 'available';
  this.reservedBy = undefined;
  return this.save();
};

// Method to mark as picked up
donationSchema.methods.markPickedUp = function() {
  this.status = 'picked-up';
  return this.save();
};

module.exports = mongoose.model('Donation', donationSchema);
