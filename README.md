# FoodShare Backend API

A comprehensive Node.js/Express backend for the FoodShare platform - connecting surplus food with those in need through donations, volunteers, and charities.

## 🚀 Features

### Core Functionality
- **User Management**: Multi-role authentication (donors, volunteers, charities, admins)
- **Food Donations**: Complete CRUD operations with expiry tracking and pickup scheduling
- **Volunteer Management**: Sign-up, availability tracking, and skill matching
- **Geolocation Services**: Location-based search and mapping for donations and users
- **Contact System**: Contact form handling with admin response management
- **Real-time Updates**: Status tracking for donations and volunteer tasks

### Technical Features
- **RESTful API**: Clean, well-documented endpoints
- **Authentication**: JWT-based secure authentication with role-based access control
- **Data Validation**: Comprehensive input validation using express-validator
- **Geospatial Queries**: MongoDB geospatial indexing for location-based searches
- **Rate Limiting**: API rate limiting for security and performance
- **Error Handling**: Centralized error handling with detailed error messages
- **Pagination**: Efficient pagination for large datasets
- **Search & Filtering**: Advanced search and filtering capabilities

## 🏗️ Architecture

```
FoodShare Backend/
├── models/           # MongoDB schemas and models
├── routes/           # API route handlers
├── middleware/       # Custom middleware (auth, validation)
├── server.js         # Main server file
├── package.json      # Dependencies and scripts
└── README.md         # This file
```

## 🛠️ Tech Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Geospatial**: MongoDB 2dsphere indexes

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd foodshare-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Configure Environment Variables**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/foodshare
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   
   # Email Configuration (optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## 🗄️ Database Setup

1. **Install MongoDB** (if not already installed)
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb
   
   # macOS with Homebrew
   brew install mongodb-community
   
   # Windows: Download from mongodb.com
   ```

2. **Start MongoDB service**
   ```bash
   # Ubuntu/Debian
   sudo systemctl start mongodb
   
   # macOS
   brew services start mongodb-community
   ```

3. **Create database**
   ```bash
   mongo
   use foodshare
   exit
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update current user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user (admin only)
- `GET /api/users/nearby` - Find users by location
- `GET /api/users/stats/overview` - User statistics (admin only)

### Donations
- `GET /api/donations` - Get all donations with filters
- `GET /api/donations/:id` - Get single donation
- `POST /api/donations` - Create new donation
- `PUT /api/donations/:id` - Update donation
- `DELETE /api/donations/:id` - Delete donation
- `POST /api/donations/:id/reserve` - Reserve donation
- `POST /api/donations/:id/cancel-reservation` - Cancel reservation
- `POST /api/donations/:id/pickup` - Mark as picked up
- `GET /api/donations/expiring-soon/:days` - Get expiring donations

### Volunteers
- `GET /api/volunteers` - Get all volunteers with filters
- `GET /api/volunteers/:id` - Get single volunteer
- `POST /api/volunteers` - Sign up as volunteer
- `PUT /api/volunteers/:id` - Update volunteer profile
- `POST /api/volunteers/:id/rate` - Rate volunteer
- `GET /api/volunteers/available/:role/:day` - Find available volunteers
- `GET /api/volunteers/stats/overview` - Volunteer statistics

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contacts (admin only)
- `GET /api/contact/:id` - Get single contact
- `POST /api/contact/:id/respond` - Respond to contact
- `POST /api/contact/:id/assign` - Assign contact to user (admin only)
- `POST /api/contact/:id/notes` - Add note to contact
- `POST /api/contact/:id/follow-up` - Schedule follow-up
- `GET /api/contact/urgent` - Get urgent contacts (admin only)

### Map & Geolocation
- `GET /api/map/donations` - Get donations by location
- `GET /api/map/users` - Get users by location
- `GET /api/map/all` - Get both donations and users by location
- `GET /api/map/stats` - Get map statistics for location
- `GET /api/map/search` - Search locations by address

## 🔐 Authentication & Authorization

### JWT Token Format
```bash
Authorization: Bearer <jwt_token>
```

### User Roles
- **donor**: Can create, update, and delete their own donations
- **volunteer**: Can reserve donations and manage volunteer profile
- **charity**: Can reserve donations and manage charity profile
- **admin**: Full access to all endpoints and user management

### Protected Routes
Most routes require authentication. Add the JWT token to the Authorization header:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/api/auth/me
```

## 📊 Data Models

### User Model
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: ['donor', 'volunteer', 'charity', 'admin'],
  organization: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  location: {
    type: 'Point',
    coordinates: [Number, Number] // [longitude, latitude]
  },
  isVerified: Boolean,
  isActive: Boolean
}
```

### Donation Model
```javascript
{
  donor: ObjectId (ref: User),
  title: String,
  description: String,
  category: ['fruits', 'vegetables', 'grains', 'dairy', 'meat', 'canned', 'baked', 'frozen', 'beverages', 'snacks', 'other'],
  quantity: {
    amount: Number,
    unit: ['kg', 'lbs', 'pieces', 'cans', 'boxes', 'bottles', 'bags']
  },
  expiryDate: Date,
  pickupDate: Date,
  pickupTime: {
    start: String (HH:MM),
    end: String (HH:MM)
  },
  location: {
    type: 'Point',
    coordinates: [Number, Number],
    address: Object
  },
  status: ['available', 'reserved', 'picked-up', 'expired', 'cancelled'],
  dietary: Object,
  storage: Object
}
```

## 🌍 Geolocation Features

### Location-based Search
The API supports geospatial queries using MongoDB's `$near` operator:

```bash
# Find donations within 25 miles of coordinates
GET /api/map/donations?lat=40.7128&lng=-74.0060&radius=25

# Find volunteers within 10 miles
GET /api/map/users?lat=40.7128&lng=-74.0060&radius=10&role=volunteer
```

### Coordinate Format
- **Latitude**: -90 to 90 (decimal degrees)
- **Longitude**: -180 to 180 (decimal degrees)
- **Radius**: 0.1 to 100 miles

## 🔍 Search & Filtering

### Donation Filters
```bash
# Filter by category and status
GET /api/donations?category=vegetables&status=available

# Filter by urgency and location
GET /api/donations?urgent=true&lat=40.7128&lng=-74.0060&radius=25

# Pagination
GET /api/donations?page=1&limit=20&sort=createdAt
```

### Volunteer Filters
```bash
# Filter by role and skills
GET /api/volunteers?role=food-collection&skills[]=driving&skills[]=lifting

# Filter by experience level
GET /api/volunteers?experience=intermediate
```

## 📱 Frontend Integration

### Example: Creating a Donation
```javascript
const createDonation = async (donationData) => {
  const response = await fetch('/api/donations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(donationData)
  });
  
  return response.json();
};

// Usage
const donation = await createDonation({
  title: 'Fresh Vegetables',
  category: 'vegetables',
  quantity: { amount: 50, unit: 'kg' },
  expiryDate: '2024-01-15',
  pickupDate: '2024-01-10',
  pickupTime: { start: '09:00', end: '17:00' },
  location: {
    coordinates: [-74.0060, 40.7128],
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    }
  }
});
```

### Example: Finding Nearby Donations
```javascript
const findNearbyDonations = async (lat, lng, radius = 25) => {
  const response = await fetch(
    `/api/map/donations?lat=${lat}&lng=${lng}&radius=${radius}`
  );
  
  return response.json();
};

// Usage
const nearbyDonations = await findNearbyDonations(40.7128, -74.0060, 25);
console.log(nearbyDonations.data.donations);
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

## 🚀 Deployment

### Production Environment
1. Set `NODE_ENV=production` in your environment
2. Use a production MongoDB instance
3. Set strong JWT secrets
4. Configure proper CORS origins
5. Use a process manager like PM2

### PM2 Configuration
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name "foodshare-api"

# Monitor
pm2 monit

# Logs
pm2 logs foodshare-api
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security**: Security headers and middleware
- **Role-based Access**: Granular permission control

## 📈 Performance Features

- **Database Indexing**: Optimized MongoDB indexes
- **Pagination**: Efficient data pagination
- **Geospatial Queries**: Fast location-based searches
- **Response Caching**: Optional response caching
- **Query Optimization**: Efficient database queries

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Check if MongoDB is running
   sudo systemctl status mongodb
   
   # Check connection string
   echo $MONGODB_URI
   ```

2. **JWT Token Issues**
   ```bash
   # Check JWT secret
   echo $JWT_SECRET
   
   # Verify token format
   # Should be: Bearer <token>
   ```

3. **Port Already in Use**
   ```bash
   # Find process using port 5000
   lsof -i :5000
   
   # Kill process
   kill -9 <PID>
   ```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check logs
tail -f logs/app.log
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the troubleshooting section

## 🔮 Future Enhancements

- **Real-time Notifications**: WebSocket support for live updates
- **File Upload**: Image upload for donations and profiles
- **Email Integration**: Automated email notifications
- **Mobile API**: Optimized endpoints for mobile apps
- **Analytics Dashboard**: Advanced reporting and analytics
- **Multi-language Support**: Internationalization features

---

**Built with ❤️ for the FoodShare community**
