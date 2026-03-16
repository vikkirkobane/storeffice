# Storeffice Project Guide for Claude Code Sessions

## Project Overview
Storeffice is a dual-purpose marketplace platform combining office space booking (like Airbnb) with product storage and sales (like Alibaba/Amazon). Users can book office spaces, rent storage for inventory, list products, and make purchases.

## Tech Stack

### Frontend (Web)
- **Framework**: React 18+
- **State Management**: Redux Toolkit
- **Routing**: React Router 6
- **UI Components**: Material-UI or Ant Design
- **Forms**: React Hook Form + Yup validation
- **HTTP Client**: Axios
- **Maps**: Google Maps JavaScript API
- **Styling**: CSS-in-JS or Tailwind CSS

### Frontend (Mobile)
- **Framework**: React Native 0.72+
- **Navigation**: React Navigation 6
- **State Management**: Redux Toolkit
- **UI Components**: React Native Paper or Native Base
- **Maps**: React Native Maps
- **Push Notifications**: Firebase Cloud Messaging

### Backend
- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js 4+
- **Authentication**: Passport.js with JWT strategy
- **Validation**: Joi or Express Validator
- **File Upload**: Multer
- **Email**: SendGrid or AWS SES
- **SMS**: Twilio

### Database
- **Primary**: MongoDB 6+ with Mongoose ODM
- **Caching**: Redis 7+
- **Search**: Elasticsearch 8+

### Infrastructure
- **Hosting**: AWS, Google Cloud, or Azure
- **Containers**: Docker with Kubernetes
- **CI/CD**: GitHub Actions or GitLab CI
- **Monitoring**: New Relic, Datadog, or Grafana

### Third-Party Services
- **Payments**: Stripe or PayPal
- **Maps**: Google Maps Platform
- **Storage**: AWS S3
- **Analytics**: Google Analytics, Mixpanel

## Core Architecture Principles

### API Design
- RESTful architecture with clear endpoint naming
- JWT-based authentication with token refresh
- API versioning (v1, v2) for breaking changes
- Consistent error response format
- Rate limiting on all endpoints

### Code Standards
- **Naming**: Use concise but meaningful variable names (e.g., `i`, `j` for loops, `e` for events, `el` for elements)
- **Testing**: Minimum 80% unit test coverage
- **Documentation**: OpenAPI/Swagger for all endpoints
- **Error Handling**: Graceful failures with user-friendly messages
- **Security**: Input validation on both client and server

### Performance Requirements
- API response time: <500ms (95th percentile)
- Page load time: <2 seconds on 4G
- Search results: <1 second
- Support 10,000 concurrent users

## User Roles & Permissions

### Customer
- Browse and book office spaces
- Browse and purchase products
- Leave reviews and ratings
- View order/booking history

### Office Owner
- Create and manage office/storage space listings
- Set pricing and availability
- Approve/decline booking requests
- View analytics and earnings

### Merchant
- Rent storage spaces
- Create and manage product listings
- Manage inventory across locations
- Process orders and track shipments
- View sales analytics

### Admin
- User management (suspend, ban, verify)
- Content moderation (listings, reviews)
- Transaction monitoring and dispute resolution
- Platform analytics and reporting
- System configuration

## Data Models

### User Schema
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  passwordHash: String (required),
  phone: String,
  firstName: String (required),
  lastName: String (required),
  profilePhoto: String (URL),
  roles: [String], // ['customer', 'merchant', 'owner', 'admin']
  isVerified: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### OfficeSpace Schema
```javascript
{
  _id: ObjectId,
  ownerId: ObjectId (ref: User),
  title: String (required),
  description: String,
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: [Number] // [longitude, latitude]
  },
  photos: [String], // URLs
  amenities: [String],
  capacity: Number,
  pricing: {
    hourly: Number,
    daily: Number,
    weekly: Number,
    monthly: Number
  },
  availability: [Object],
  rating: Number,
  reviewCount: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### StorageSpace Schema
```javascript
{
  _id: ObjectId,
  ownerId: ObjectId (ref: User),
  title: String (required),
  description: String,
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: [Number]
  },
  photos: [String],
  storageType: String, // 'shelf', 'room', 'warehouse'
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: String // 'feet', 'meters'
  },
  features: [String],
  pricing: {
    monthly: Number,
    annual: Number
  },
  isAvailable: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Schema
```javascript
{
  _id: ObjectId,
  customerId: ObjectId (ref: User),
  spaceId: ObjectId (ref: OfficeSpace),
  startDate: Date (required),
  endDate: Date (required),
  totalPrice: Number (required),
  status: String, // 'pending', 'confirmed', 'cancelled', 'completed'
  paymentId: ObjectId (ref: Payment),
  cancellationPolicy: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Schema
```javascript
{
  _id: ObjectId,
  merchantId: ObjectId (ref: User),
  storageId: ObjectId (ref: StorageSpace),
  title: String (required),
  description: String,
  category: String,
  subcategory: String,
  price: Number (required),
  images: [String],
  inventory: Number,
  sku: String,
  rating: Number,
  reviewCount: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```javascript
{
  _id: ObjectId,
  customerId: ObjectId (ref: User),
  items: [{
    productId: ObjectId (ref: Product),
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  shippingAddress: Object,
  status: String, // 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
  paymentId: ObjectId (ref: Payment),
  createdAt: Date,
  updatedAt: Date
}
```

### Review Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  targetId: ObjectId, // OfficeSpace, Product, or StorageSpace
  targetType: String, // 'office', 'product', 'storage'
  rating: Number (1-5, required),
  comment: String,
  photos: [String],
  response: String, // Owner/Merchant response
  isVerified: Boolean, // Verified purchase/booking
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  amount: Number (required),
  currency: String (default: 'USD'),
  paymentMethod: String, // 'card', 'paypal', etc.
  paymentGateway: String, // 'stripe', 'paypal'
  transactionId: String (unique),
  status: String, // 'pending', 'completed', 'failed', 'refunded'
  metadata: Object, // Booking or Order details
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: String, // 'booking', 'order', 'payment', 'message', 'review'
  title: String (required),
  message: String (required),
  data: Object, // Additional context
  isRead: Boolean (default: false),
  createdAt: Date
}
```

### Message Schema
```javascript
{
  _id: ObjectId,
  conversationId: ObjectId (ref: Conversation),
  senderId: ObjectId (ref: User),
  receiverId: ObjectId (ref: User),
  content: String (required),
  attachments: [String], // URLs
  isRead: Boolean (default: false),
  createdAt: Date
}
```

## API Endpoints Structure

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh-token` - Refresh JWT token
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `POST /verify-email` - Verify email address
- `POST /resend-verification` - Resend verification email

### Users (`/api/users`)
- `GET /me` - Get current user profile
- `PUT /me` - Update current user profile
- `POST /me/photo` - Upload profile photo
- `PUT /me/password` - Change password
- `DELETE /me` - Delete account
- `GET /:id` - Get user profile (public info)
- `GET /:id/reviews` - Get user reviews

### Office Spaces (`/api/office-spaces`)
- `GET /` - List all office spaces (with filters)
- `GET /search` - Search office spaces
- `GET /:id` - Get single office space details
- `POST /` - Create office space listing (Owner)
- `PUT /:id` - Update office space listing (Owner)
- `DELETE /:id` - Delete office space listing (Owner)
- `GET /:id/availability` - Check availability
- `POST /:id/availability` - Update availability (Owner)

### Storage Spaces (`/api/storage-spaces`)
- `GET /` - List all storage spaces (with filters)
- `GET /search` - Search storage spaces
- `GET /:id` - Get single storage space details
- `POST /` - Create storage space listing (Owner)
- `PUT /:id` - Update storage space listing (Owner)
- `DELETE /:id` - Delete storage space listing (Owner)
- `GET /:id/availability` - Check availability

### Bookings (`/api/bookings`)
- `GET /` - List user's bookings
- `GET /:id` - Get booking details
- `POST /` - Create new booking
- `PUT /:id/cancel` - Cancel booking
- `PUT /:id/approve` - Approve booking (Owner)
- `PUT /:id/decline` - Decline booking (Owner)
- `POST /:id/review` - Add review for booking

### Rentals (`/api/rentals`)
- `GET /` - List user's storage rentals
- `GET /:id` - Get rental details
- `POST /` - Create storage rental (Merchant)
- `PUT /:id/extend` - Extend rental period
- `PUT /:id/terminate` - Terminate rental

### Products (`/api/products`)
- `GET /` - List all products (with filters)
- `GET /search` - Search products
- `GET /:id` - Get product details
- `POST /` - Create product listing (Merchant)
- `PUT /:id` - Update product listing (Merchant)
- `DELETE /:id` - Delete product listing (Merchant)
- `PUT /:id/inventory` - Update inventory (Merchant)
- `POST /bulk-upload` - Bulk upload via CSV (Merchant)

### Orders (`/api/orders`)
- `GET /` - List user's orders
- `GET /:id` - Get order details
- `POST /` - Create new order
- `PUT /:id/cancel` - Cancel order
- `PUT /:id/status` - Update order status (Merchant)
- `POST /:id/review` - Add review for order

### Cart (`/api/cart`)
- `GET /` - Get current cart
- `POST /items` - Add item to cart
- `PUT /items/:itemId` - Update cart item quantity
- `DELETE /items/:itemId` - Remove item from cart
- `DELETE /` - Clear cart

### Reviews (`/api/reviews`)
- `GET /` - List reviews (filtered by target)
- `GET /:id` - Get review details
- `POST /` - Create review
- `PUT /:id` - Update review
- `DELETE /:id` - Delete review
- `POST /:id/response` - Add owner/merchant response
- `POST /:id/report` - Report inappropriate review

### Payments (`/api/payments`)
- `POST /process` - Process payment
- `GET /:id` - Get payment details
- `POST /:id/refund` - Process refund (Admin)
- `GET /methods` - Get saved payment methods
- `POST /methods` - Add payment method
- `DELETE /methods/:id` - Remove payment method

### Messages (`/api/messages`)
- `GET /conversations` - List conversations
- `GET /conversations/:id` - Get conversation messages
- `POST /conversations` - Start new conversation
- `POST /conversations/:id/messages` - Send message
- `PUT /messages/:id/read` - Mark message as read

### Notifications (`/api/notifications`)
- `GET /` - List user notifications
- `GET /unread-count` - Get unread count
- `PUT /:id/read` - Mark as read
- `PUT /read-all` - Mark all as read
- `DELETE /:id` - Delete notification

### Analytics (`/api/analytics`)
- `GET /dashboard` - Get dashboard metrics (role-based)
- `GET /bookings` - Get booking analytics (Owner)
- `GET /sales` - Get sales analytics (Merchant)
- `GET /revenue` - Get revenue analytics (Owner/Merchant)
- `GET /users` - Get user analytics (Admin)

### Admin (`/api/admin`)
- `GET /users` - List all users
- `PUT /users/:id/verify` - Verify user account
- `PUT /users/:id/suspend` - Suspend user account
- `PUT /users/:id/ban` - Ban user account
- `GET /listings` - List all listings (pending moderation)
- `PUT /listings/:id/approve` - Approve listing
- `PUT /listings/:id/reject` - Reject listing
- `GET /reports` - List reported content
- `PUT /reports/:id/resolve` - Resolve report
- `GET /transactions` - List all transactions
- `GET /statistics` - Platform-wide statistics

## Security Requirements

### Authentication
- JWT tokens with 24-hour expiration
- Refresh tokens for extended sessions
- Secure password hashing with bcrypt (12+ rounds)
- Multi-factor authentication support
- Rate limiting on auth endpoints (max 5 attempts per minute)

### Authorization
- Role-based access control (RBAC)
- Middleware to verify user roles for protected routes
- Owner verification for listing modifications
- Admin-only endpoints properly secured

### Data Protection
- All data in transit encrypted with TLS 1.3
- Sensitive data at rest encrypted (passwords, payment info)
- Never store complete credit card numbers
- PCI-DSS compliance for payment handling
- Input sanitization to prevent XSS and SQL injection

### API Security
- CORS configuration for allowed origins
- CSRF protection for state-changing operations
- Request size limits to prevent DoS
- Rate limiting per user/IP address
- API key validation for third-party integrations

## Key Features to Implement

### Phase 1: MVP (Months 1-3)
1. User authentication and profile management
2. Office space listing creation and management
3. Office space search and filtering
4. Booking flow with calendar
5. Payment integration (Stripe)
6. Basic admin panel
7. Email notifications

### Phase 2: Marketplace (Months 4-6)
1. Storage space listings and rentals
2. Product listing creation
3. Product search and filtering
4. Shopping cart and checkout
5. Order management
6. Review and rating system
7. User messaging
8. Mobile app core features

### Phase 3: Enhancement (Months 7-9)
1. Analytics dashboards for all roles
2. Inventory management for merchants
3. Advanced filters and sorting
4. Wishlist/favorites
5. Promotional codes
6. Admin moderation tools
7. Performance optimization
8. Comprehensive testing

### Phase 4: Launch (Months 10-12)
1. Soft launch in limited markets
2. Marketing campaigns
3. SEO optimization
4. Referral program
5. Customer support system
6. Full market expansion

## Common Development Patterns

### API Response Format
```javascript
// Success response
{
  success: true,
  data: {...},
  message: "Operation successful"
}

// Error response
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Human-readable error message",
    details: {...} // Optional
  }
}

// Paginated response
{
  success: true,
  data: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 150,
    pages: 8
  }
}
```

### Authentication Middleware
```javascript
// Protect routes with JWT verification
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'No token provided' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Role-based authorization
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.some(role => req.user.roles.includes(role))) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### Error Handling
```javascript
// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';
  
  console.error('Error:', err);
  
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};
```

### Database Queries with Pagination
```javascript
// Reusable pagination helper
const paginate = async (model, query, page = 1, limit = 20, populate = '') => {
  const skip = (page - 1) * limit;
  const total = await model.countDocuments(query);
  const data = await model.find(query)
    .populate(populate)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};
```

## Testing Guidelines

### Unit Tests
- Test individual functions and utilities
- Mock external dependencies
- Use Jest for testing framework
- Aim for >80% code coverage

### Integration Tests
- Test API endpoints end-to-end
- Use Supertest for HTTP assertions
- Test authentication and authorization flows
- Verify database operations

### Example Test Structure
```javascript
describe('Office Space API', () => {
  describe('POST /api/office-spaces', () => {
    it('should create office space with valid data', async () => {
      const token = await getAuthToken('owner');
      const response = await request(app)
        .post('/api/office-spaces')
        .set('Authorization', `Bearer ${token}`)
        .send(validOfficeSpaceData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
    });
    
    it('should reject creation without authentication', async () => {
      await request(app)
        .post('/api/office-spaces')
        .send(validOfficeSpaceData)
        .expect(401);
    });
  });
});
```

## Environment Variables
```bash
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/storeffice
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRE=24h
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRE=7d

# Email
SENDGRID_API_KEY=your-sendgrid-key
EMAIL_FROM=noreply@storeffice.com

# SMS
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-phone-number

# Payment
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# Maps
GOOGLE_MAPS_API_KEY=your-google-maps-key

# Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=storeffice-uploads
AWS_REGION=us-east-1

# Client URLs (for CORS and redirects)
WEB_URL=http://localhost:3000
MOBILE_DEEP_LINK=storeffice://

# Analytics
GOOGLE_ANALYTICS_ID=your-ga-id
MIXPANEL_TOKEN=your-mixpanel-token

# Feature Flags
ENABLE_REGISTRATION=true
ENABLE_INSTANT_BOOKING=false
ENABLE_MODERATION=true
```

## File Structure
```
storeffice/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── passport.js
│   │   │   └── redis.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── officeSpaceController.js
│   │   │   ├── storageSpaceController.js
│   │   │   ├── bookingController.js
│   │   │   ├── productController.js
│   │   │   ├── orderController.js
│   │   │   └── adminController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── OfficeSpace.js
│   │   │   ├── StorageSpace.js
│   │   │   ├── Booking.js
│   │   │   ├── Product.js
│   │   │   ├── Order.js
│   │   │   ├── Review.js
│   │   │   ├── Payment.js
│   │   │   └── Notification.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── officeSpaceRoutes.js
│   │   │   ├── storageSpaceRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── validation.js
│   │   │   ├── upload.js
│   │   │   └── rateLimiter.js
│   │   ├── services/
│   │   │   ├── emailService.js
│   │   │   ├── smsService.js
│   │   │   ├── paymentService.js
│   │   │   ├── storageService.js
│   │   │   └── notificationService.js
│   │   ├── utils/
│   │   │   ├── validators.js
│   │   │   ├── helpers.js
│   │   │   └── constants.js
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── package.json
│   └── .env
├── frontend-web/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── auth/
│   │   │   ├── spaces/
│   │   │   ├── products/
│   │   │   └── admin/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── SpaceSearch.jsx
│   │   │   ├── SpaceDetail.jsx
│   │   │   ├── ProductSearch.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── redux/
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── spaceSlice.js
│   │   │   │   ├── productSlice.js
│   │   │   │   └── cartSlice.js
│   │   │   └── store.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── spaceService.js
│   │   │   └── productService.js
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json
│   └── .env
├── frontend-mobile/
│   ├── android/
│   ├── ios/
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── redux/
│   │   ├── services/
│   │   └── utils/
│   ├── App.js
│   ├── package.json
│   └── .env
└── README.md
```

## Development Workflow

### Starting a New Feature
1. Create feature branch: `git checkout -b feature/feature-name`
2. Review relevant data models and API endpoints
3. Implement backend API endpoints first
4. Write unit tests for controllers and services
5. Implement frontend components
6. Test integration end-to-end
7. Create pull request with description
8. Address code review feedback
9. Merge to development branch

### Code Review Checklist
- [ ] Code follows project style guide
- [ ] All tests pass
- [ ] No security vulnerabilities introduced
- [ ] Error handling implemented
- [ ] Input validation on both client and server
- [ ] API documentation updated
- [ ] Database indexes added for new queries
- [ ] No sensitive data logged
- [ ] Performance considerations addressed

## Common Issues and Solutions

### Issue: Double Booking Prevention
**Solution**: Use optimistic locking with version field in booking schema. Check availability and update in single atomic operation.

### Issue: Handling Payment Failures
**Solution**: Implement idempotency keys, webhook handlers for async payment confirmation, and proper rollback mechanisms.

### Issue: Image Upload Performance
**Solution**: Compress images on client side, use progressive loading, implement CDN for delivery, lazy load images in lists.

### Issue: Search Performance
**Solution**: Implement Elasticsearch for full-text search, use MongoDB indexes for filtered queries, cache popular searches in Redis.

### Issue: Concurrent Booking Conflicts
**Solution**: Use MongoDB transactions for multi-document updates, implement optimistic locking, return clear conflict errors.

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Third-party API keys validated
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] CDN configured for static assets

### Post-Deployment
- [ ] Verify all endpoints responding
- [ ] Test authentication flows
- [ ] Verify payment processing
- [ ] Check email delivery
- [ ] Monitor error logs
- [ ] Verify database connections
- [ ] Test mobile app connections

## Important Notes

### Never Store in Code
- API keys or secrets
- Database credentials
- Payment gateway keys
- User passwords (only hashes)
- Complete credit card numbers

### Always Validate
- User inputs on server side
- File uploads (type, size, content)
- Email format and domain
- Phone number format
- Price and quantity values

### Remember to
- Use environment variables for configuration
- Implement proper error logging
- Add request/response logging for debugging
- Use database transactions for critical operations
- Implement proper indexing for queries
- Cache frequently accessed data
- Sanitize all user inputs
- Rate limit authentication endpoints

## Support and Resources

### Documentation Links
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [React Documentation](https://react.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Google Maps Platform](https://developers.google.com/maps/documentation)

### Project Communication
- Daily standups for blockers
- Weekly sprint planning
- Code reviews within 24 hours
- Document major decisions in project wiki
- Use issue tracker for bugs and features

---

**Last Updated**: [Current Date]  
**Version**: 1.0  
**Maintainer**: Development Team