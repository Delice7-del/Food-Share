const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  role: {
    type: String,
    required: [true, 'Volunteer role is required'],
    enum: ['food-collection', 'food-distribution', 'coordination', 'driving', 'sorting', 'admin']
  },
  availability: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    timeSlots: [{
      start: {
        type: String,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)']
      },
      end: {
        type: String,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)']
      }
    }],
    isFlexible: {
      type: Boolean,
      default: false
    }
  },
  skills: [{
    type: String,
    enum: [
      'driving',
      'lifting',
      'cooking',
      'organization',
      'communication',
      'first-aid',
      'food-safety',
      'logistics',
      'customer-service',
      'multilingual'
    ]
  }],
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  certifications: [{
    name: String,
    issuingOrganization: String,
    issueDate: Date,
    expiryDate: Date,
    certificateNumber: String
  }],
  vehicle: {
    hasVehicle: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['car', 'van', 'truck', 'motorcycle', 'bicycle']
    },
    capacity: {
      weight: Number, // in kg
      volume: Number, // in cubic meters
      passengers: Number
    },
    insurance: {
      type: Boolean,
      default: false
    }
  },
  preferences: {
    maxDistance: {
      type: Number,
      default: 25, // miles
      min: 1,
      max: 100
    },
    maxDuration: {
      type: Number,
      default: 4, // hours
      min: 1,
      max: 12
    },
    foodTypes: [{
      type: String,
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
    }],
    specialNeeds: {
      wheelchairAccessible: { type: Boolean, default: false },
      nonEnglishSpeaking: { type: Boolean, default: false },
      physicalLimitations: { type: Boolean, default: false }
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending-approval'],
    default: 'pending-approval'
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    reviews: [{
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  completedTasks: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VolunteerTask'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    feedback: String
  }],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  notes: String,
  isBackgroundChecked: {
    type: Boolean,
    default: false
  },
  backgroundCheckDate: Date,
  trainingCompleted: [{
    course: String,
    completedAt: Date,
    certificate: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


volunteerSchema.index({ user: 1 });
volunteerSchema.index({ role: 1, status: 1 });
volunteerSchema.index({ 'availability.days': 1 });
volunteerSchema.index({ skills: 1 });


volunteerSchema.virtual('totalHours').get(function() {
  return this.completedTasks.length * 2; 
});


volunteerSchema.virtual('availabilityString').get(function() {
  if (!this.availability.days.length) return 'No availability set';
  
  const days = this.availability.days.map(day => 
    day.charAt(0).toUpperCase() + day.slice(1)
  ).join(', ');
  
  return `${days} - ${this.availability.isFlexible ? 'Flexible' : 'Fixed'} hours`;
});


volunteerSchema.virtual('skillsString').get(function() {
  return this.skills.join(', ') || 'No skills specified';
});


volunteerSchema.methods.updateRating = function(newRating, reviewerId, comment = '') {
  this.rating.reviews.push({
    reviewer: reviewerId,
    rating: newRating,
    comment
  });

  const totalRating = this.rating.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating.average = totalRating / this.rating.reviews.length;
  this.rating.count = this.rating.reviews.length;
  
  return this.save();
};


volunteerSchema.methods.addCompletedTask = function(taskId, feedback = '') {
  this.completedTasks.push({
    task: taskId,
    feedback
  });
  return this.save();
};


volunteerSchema.methods.isAvailable = function(day, startTime, endTime) {
  if (!this.availability.days.includes(day.toLowerCase())) {
    return false;
  }
  
  if (this.availability.isFlexible) {
    return true;
  }
  
 
  return this.availability.timeSlots.some(slot => {
    const slotStart = this.parseTime(slot.start);
    const slotEnd = this.parseTime(slot.end);
    const requestStart = this.parseTime(startTime);
    const requestEnd = this.parseTime(endTime);
    
    return requestStart >= slotStart && requestEnd <= slotEnd;
  });
};


volunteerSchema.methods.parseTime = function(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};


volunteerSchema.statics.findAvailable = function(role, day, startTime, endTime, location) {
  return this.find({
    role: role,
    status: 'active',
    'availability.days': day.toLowerCase()
  }).populate('user', 'firstName lastName phone email location');
};


volunteerSchema.statics.findBySkills = function(skills) {
  return this.find({
    skills: { $in: skills },
    status: 'active'
  }).populate('user', 'firstName lastName phone email');
};

module.exports = mongoose.model('Volunteer', volunteerSchema);
