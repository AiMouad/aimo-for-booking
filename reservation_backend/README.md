# 🏨 Reservation Backend API

A professional, production-ready Django REST API for a reservation SaaS platform similar to Airbnb or Booking.com.

## 🚀 Features

### Core Functionality
- **User Management**: Role-based authentication (Owner, Worker, Client)
- **Property Management**: Hotels, residences, apartments with rich metadata
- **Booking System**: Complete reservation lifecycle with availability management
- **Payment Processing**: Multi-gateway support with refund policies
- **Review System**: Guest reviews with ratings and moderation
- **Notifications**: Real-time alerts and email notifications
- **AI Chatbot**: Smart assistant for property recommendations

### Technical Features
- **RESTful API**: Versioned endpoints with OpenAPI documentation
- **JWT Authentication**: Secure token-based authentication
- **PostgreSQL**: Production-ready database with optimized queries
- **Redis Caching**: Performance optimization with Redis
- **Celery**: Background tasks for email and notifications
- **Docker**: Containerized deployment
- **Comprehensive Testing**: Unit, integration, and E2E tests

## 📋 Architecture

### Project Structure
```
reservation_backend/
├── apps/                    # Django apps
│   ├── users/              # User management & auth
│   ├── properties/         # Property & apartment management
│   ├── bookings/           # Reservation system
│   ├── payments/           # Payment processing
│   ├── reviews/            # Rating & review system
│   ├── notifications/      # Alert system
│   └── chatbot/            # AI assistant
├── core/                   # Core configuration
│   ├── config/
│   │   ├── settings/       # Environment-based settings
│   │   └── urls.py         # URL configuration
│   ├── permissions/        # Custom permissions
│   ├── services/           # Business logic layer
│   └── utils/              # Shared utilities
├── requirements/           # Environment-specific dependencies
├── tests/                  # Test suite
└── docs/                   # Documentation
```

### Database Schema
- **Users**: Enhanced user model with roles and profiles
- **Properties**: Rich property data with location and amenities
- **Apartments**: Individual units with pricing and availability
- **Bookings**: Complete booking lifecycle with payment tracking
- **Payments**: Multi-gateway payment processing
- **Reviews**: Guest reviews with moderation
- **Notifications**: Real-time alert system

## 🛠️ Installation

### Prerequisites
- Python 3.11+
- PostgreSQL 14+
- Redis 6+
- Node.js 18+ (for frontend)

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd reservation_backend
```

2. **Set up virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements/development.txt
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Database setup**
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

6. **Start development server**
```bash
python manage.py runserver
```

### Docker Setup

1. **Build and run with Docker Compose**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

2. **Run migrations**
```bash
docker-compose exec backend python manage.py migrate
```

## 📚 API Documentation

### Base URL
- Development: `http://localhost:8000/api/v1/`
- Production: `https://api.yourdomain.com/api/v1/`

### Authentication
All endpoints require JWT authentication except for:
- `POST /auth/register/` - User registration
- `POST /auth/login/` - User login
- `GET /health/` - Health check

### Main Endpoints

#### Authentication
```
POST /auth/login/           # User login
POST /auth/register/        # User registration
POST /auth/refresh/         # Refresh JWT token
GET  /auth/me/              # Get current user
PUT  /auth/me/              # Update user profile
```

#### Properties
```
GET    /properties/         # List properties
POST   /properties/         # Create property (owner only)
GET    /properties/{id}/    # Get property details
PUT    /properties/{id}/    # Update property (owner only)
DELETE /properties/{id}/    # Delete property (owner only)
GET    /properties/search/  # Search properties
```

#### Apartments
```
GET    /apartments/         # List apartments
POST   /apartments/         # Create apartment (owner only)
GET    /apartments/{id}/    # Get apartment details
PUT    /apartments/{id}/    # Update apartment (owner only)
DELETE /apartments/{id}/    # Delete apartment (owner only)
GET    /apartments/{id}/availability/  # Check availability
```

#### Bookings
```
GET    /bookings/           # List bookings (filtered by role)
POST   /bookings/           # Create booking
GET    /bookings/{id}/      # Get booking details
PUT    /bookings/{id}/      # Update booking
DELETE /bookings/{id}/      # Delete booking
POST   /bookings/{id}/confirm/     # Confirm booking
POST   /bookings/{id}/cancel/      # Cancel booking
POST   /bookings/{id}/complete/    # Complete booking
GET    /bookings/my/        # Current user's bookings
GET    /bookings/statistics/ # Booking statistics
```

#### Payments
```
GET    /payments/           # List payments
POST   /payments/           # Create payment
GET    /payments/{id}/      # Get payment details
POST   /payments/{id}/process/    # Process payment
POST   /payments/{id}/refund/     # Process refund
```

#### Reviews
```
GET    /reviews/            # List reviews
POST   /reviews/            # Create review
GET    /reviews/{id}/       # Get review details
PUT    /reviews/{id}/       # Update review
DELETE /reviews/{id}/       # Delete review
POST   /reviews/{id}/helpful/   # Mark as helpful
POST   /reviews/{id}/report/     # Report review
```

### API Documentation
- **Swagger UI**: `/api/docs/`
- **ReDoc**: `/api/redoc/`
- **OpenAPI Schema**: `/api/schema/`

## 🔐 Security

### Authentication
- JWT tokens with refresh mechanism
- Role-based access control (RBAC)
- Permission classes for object-level security

### Security Features
- CORS configuration
- Rate limiting
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Secure headers

### Best Practices
- Environment variable configuration
- Password hashing with bcrypt
- Email verification
- Session management
- Audit logging

## 🧪 Testing

### Run Tests
```bash
# Run all tests
python manage.py test

# Run with coverage
pytest --cov=apps

# Run specific app tests
python manage.py test apps.bookings

# Run with specific test file
python manage.py test apps.bookings.tests.test_models
```

### Test Coverage
- Unit tests for models and services
- Integration tests for API endpoints
- E2E tests for complete workflows
- Performance tests for critical endpoints

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
```bash
# Set production environment
export DJANGO_SETTINGS_MODULE=core.config.settings.production

# Install production dependencies
pip install -r requirements/production.txt
```

2. **Database Migration**
```bash
python manage.py migrate --settings=core.config.settings.production
```

3. **Collect Static Files**
```bash
python manage.py collectstatic --noinput
```

4. **Start Gunicorn**
```bash
gunicorn core.config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

### Docker Deployment
```bash
# Build production image
docker build -t reservation-backend .

# Run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
```bash
# Core Settings
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com

# Database
DB_NAME=reservation_db
DB_USER=reservation_user
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# External APIs
OPENAI_API_KEY=your-openai-key
STRIPE_SECRET_KEY=your-stripe-key
STRIPE_PUBLISHABLE_KEY=your-stripe-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

## 📊 Monitoring & Logging

### Logging
- Structured logging with JSON format
- Log rotation for production
- Different log levels for different environments
- Error tracking with Sentry

### Monitoring
- Health check endpoints
- Performance metrics
- Database query monitoring
- API response time tracking

### Health Checks
- Database connectivity
- Redis connectivity
- Celery worker status
- External service dependencies

## 🔧 Configuration

### Settings Structure
- `base.py`: Common settings for all environments
- `development.py`: Development-specific settings
- `production.py`: Production-specific settings
- `testing.py`: Test environment settings

### Feature Flags
Control features via environment variables:
- `ENABLE_CHATBOT`: Enable/disable AI chatbot
- `ENABLE_SMART_SEARCH`: Enable/disable smart search
- `ENABLE_NOTIFICATIONS`: Enable/disable notifications
- `ENABLE_REVIEWS`: Enable/disable review system
- `ENABLE_PAYMENTS`: Enable/disable payment processing

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Run test suite
5. Submit pull request

### Code Quality
- Black for code formatting
- isort for import sorting
- flake8 for linting
- mypy for type checking
- pre-commit hooks

### Commit Messages
Follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `style:` Code style
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- API Documentation: `/api/docs/`
- Developer Guide: `/docs/`
- Troubleshooting: `/docs/troubleshooting.md`

### Contact
- Email: support@reservation-api.com
- GitHub Issues: Report bugs and feature requests
- Discord: Community support

## 🔄 Version History

### v1.0.0 (2024-01-01)
- Initial release
- Core booking functionality
- User authentication
- Property management
- Payment processing
- Review system
- Notifications
- AI chatbot integration

---

**Built with ❤️ using Django REST Framework**
