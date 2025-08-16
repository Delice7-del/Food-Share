const jwt = require('jsonwebtoken');
const User = require('../models/User');


const protect = async (req, res, next) => {
  let token;

  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  
  if (!token) {
    return res.status(401).json({
      error: 'Not authorized to access this route',
      message: 'Please provide a valid authentication token'
    });
  }

  try {
  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

 
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'The user associated with this token no longer exists'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account deactivated',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please log in again.'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Authentication error',
      message: 'An error occurred during authentication'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Not authenticated',
        message: 'Please log in to access this resource'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Silently fail for optional auth
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
};

// Rate limiting for authentication attempts
const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, 
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again in 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
};


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};


const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  authRateLimit,
  generateToken,
  verifyToken
};
