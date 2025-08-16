const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [100, 'Subject cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  category: {
    type: String,
    enum: ['general', 'donation', 'volunteer', 'partnership', 'support', 'feedback', 'other'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved', 'closed'],
    default: 'new'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  response: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date,
    isEmailSent: {
      type: Boolean,
      default: false
    }
  },
  tags: [String],
  source: {
    type: String,
    enum: ['website', 'mobile-app', 'email', 'phone', 'social-media'],
    default: 'website'
  },
  userAgent: String,
  ipAddress: String,
  location: {
    country: String,
    region: String,
    city: String
  },
  followUp: {
    scheduled: {
      type: Boolean,
      default: false
    },
    date: Date,
    notes: String
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
contactSchema.index({ status: 1, priority: 1, createdAt: -1 });
contactSchema.index({ category: 1, status: 1 });
contactSchema.index({ email: 1 });
contactSchema.index({ assignedTo: 1 });

// Virtual for full name
contactSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for response time
contactSchema.virtual('responseTime').get(function() {
  if (!this.response.respondedAt) return null;
  return this.response.respondedAt - this.createdAt;
});

// Virtual for age in hours
contactSchema.virtual('ageInHours').get(function() {
  const now = new Date();
  return Math.floor((now - this.createdAt) / (1000 * 60 * 60));
});

// Pre-save middleware to set priority based on category
contactSchema.pre('save', function(next) {
  if (this.category === 'urgent' || this.message.toLowerCase().includes('urgent')) {
    this.priority = 'urgent';
  }
  next();
});

// Method to add note
contactSchema.methods.addNote = function(content, userId) {
  this.notes.push({
    content,
    addedBy: userId
  });
  return this.save();
};

// Method to respond to contact
contactSchema.methods.respond = function(message, userId) {
  this.response = {
    message,
    respondedBy: userId,
    respondedAt: new Date(),
    isEmailSent: false
  };
  this.status = 'resolved';
  return this.save();
};

// Method to assign to user
contactSchema.methods.assignTo = function(userId) {
  this.assignedTo = userId;
  this.status = 'in-progress';
  return this.save();
};

// Method to schedule follow-up
contactSchema.methods.scheduleFollowUp = function(date, notes = '') {
  this.followUp = {
    scheduled: true,
    date,
    notes
  };
  return this.save();
};

// Static method to find urgent contacts
contactSchema.statics.findUrgent = function() {
  return this.find({
    $or: [
      { priority: 'urgent' },
      { priority: 'high', status: 'new' },
      { 
        priority: 'medium', 
        status: 'new', 
        createdAt: { $lte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Older than 24 hours
      }
    ]
  }).populate('assignedTo', 'firstName lastName email');
};

// Static method to find contacts by category
contactSchema.statics.findByCategory = function(category, limit = 50) {
  return this.find({ category })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('assignedTo', 'firstName lastName');
};

// Static method to get contact statistics
contactSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgResponseTime: { $avg: '$responseTime' }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$count' },
        byStatus: {
          $push: {
            status: '$_id',
            count: '$count',
            avgResponseTime: '$avgResponseTime'
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Contact', contactSchema);
