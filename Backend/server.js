const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

console.log('🏁 Starting FoodShare API...');
console.log(`📦 Node Version: ${process.version}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
console.log(`🔌 Port: ${process.env.PORT || 5002}`);

const compression = require('compression');
const morgan = require('morgan');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
  }
});

// Socket.io connection logic
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(userId);
    console.log(`✅ User ${userId} joined room`);
  }

  socket.on('disconnect', () => {
    console.log('❌ User disconnected');
  });
});

// Make io accessible in routes
app.set('io', io);

const PORT = process.env.PORT || 5002;

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const foodRoutes = require('./routes/food');
const contactRoutes = require('./routes/contact');
const donorRoutes = require('./routes/donor');
const receiverRoutes = require('./routes/receiver');
const notificationRoutes = require('./routes/notifications');
const messageRoutes = require('./routes/messages');
const donationRoutes = require('./routes/donations');
const mapRoutes = require('./routes/map');

// Root endpoint
app.get('/', (req, res) => {
  console.log('🏠 Root endpoint hit');
  res.status(200).json({
    status: 'Success',
    message: 'Welcome to the FoodShare API',
    docs: 'Use /api/<resource> to access endpoints',
    health: '/health'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('🏥 Health check endpoint hit');
  res.status(200).json({
    status: 'OK',
    message: 'FoodShare API is running',
    timestamp: new Date().toISOString()
  });
});

app.use(helmet());
app.use(compression());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from any origin in development
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173'
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin) || !origin) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, 
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, 
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));


// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/receiver', receiverRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/map', mapRoutes);

// 404 handler
app.use('*', (req, res) => {
  console.log(`🔍 404 Not Found: ${req.method} ${req.originalUrl || req.url}`);
  res.status(404).json({
    error: 'Route not found',
    message: 'The requested API endpoint does not exist',
    requestedUrl: req.originalUrl || req.url
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from MongoDB');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 Mongoose reconnected to MongoDB');
});

console.log('🔌 Connecting to MongoDB...');
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodshare';

if (!process.env.MONGODB_URI) {
  console.warn('⚠️ MONGODB_URI is not set. Falling back to 127.0.0.1 (IPv4).');
}

console.log(`🔗 Using URI: ${mongoUri.replace(/:([^@]+)@/, ':****@')}`); // Mask password if present

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
})
  .then(() => {
    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 FoodShare API server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB initial connection error details:', err.message);
    if (err.reason) console.error('   Reason:', err.reason);
    
    // Ensure logs are flushed before exiting
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

module.exports = app;
