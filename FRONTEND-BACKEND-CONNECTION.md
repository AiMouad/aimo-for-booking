# 🔗 Frontend-Backend Connection Guide

This guide explains how the frontend and backend are connected and how to test the integration.

## 📋 Overview

The frontend (React) and backend (Django) are connected via a RESTful API with JWT authentication. The frontend uses Axios for HTTP requests with automatic token management and error handling.

## 🏗️ Architecture

### Frontend Services
```
src/services/
├── api.js              # Base API configuration
├── auth.service.js      # Authentication service
├── property.service.js  # Property management
├── reservation.service.js # Booking system
├── notification.service.js # Notifications
└── chatbot.service.js   # AI assistant
```

### Backend Endpoints
```
/api/v1/
├── auth/               # Authentication endpoints
├── properties/         # Property management
├── bookings/           # Booking system
├── payments/           # Payment processing
├── reviews/            # Review system
├── notifications/      # Alert system
└── chatbot/            # AI assistant
```

## 🔧 Configuration

### Frontend Configuration

1. **Environment Variables**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your backend URL
REACT_APP_API_URL=http://localhost:8000/api/v1
```

2. **API Base Configuration** (`src/services/api.js`)
- Base URL: `http://localhost:8000/api/v1`
- JWT token management
- Automatic token refresh
- Error handling
- Request/response interceptors

### Backend Configuration

1. **CORS Settings** (`core/config/settings/base.py`)
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React dev server
    "http://127.0.0.1:3000",
]
```

2. **JWT Settings** (`core/config/settings/base.py`)
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}
```

## 🔐 Authentication Flow

### 1. User Registration
```
Frontend → POST /api/v1/auth/register/ → Backend
Backend → {access, refresh, user} → Frontend
Frontend → Store tokens in localStorage
```

### 2. User Login
```
Frontend → POST /api/v1/auth/login/ → Backend
Backend → {access, refresh, user} → Frontend
Frontend → Store tokens & update Redux store
```

### 3. Token Refresh
```
Frontend → API Request → Backend
Backend → 401 Unauthorized → Frontend
Frontend → POST /api/v1/auth/refresh/ → Backend
Backend → {access} → Frontend
Frontend → Retry original request
```

## 📡 API Communication

### Request Flow
1. **Request Interceptor**: Adds JWT token to headers
2. **API Call**: Makes request to backend
3. **Response Interceptor**: Handles success/error responses
4. **Error Handling**: Formats errors for UI display

### Error Handling
```javascript
// Frontend error types
{
  type: 'validation',      // 400 Bad Request
  type: 'authentication',  // 401 Unauthorized
  type: 'authorization',   // 403 Forbidden
  type: 'not_found',      // 404 Not Found
  type: 'rate_limit',      // 429 Too Many Requests
  type: 'server_error',    // 500 Server Error
  type: 'network',         // Network issues
  type: 'client',          // Client-side errors
}
```

## 🧪 Testing the Connection

### 1. Health Check
```bash
# Test backend health
curl http://localhost:8000/health/

# Expected response
{
  "status": "healthy",
  "version": "1.0.0",
  "service": "reservation-backend"
}
```

### 2. API Integration Test
```javascript
// Run in browser console
import APIIntegrationTest from './utils/api-integration-test.js';

// Run all tests
const test = new APIIntegrationTest();
await test.runAllTests();

// Run single test
await test.runSingleTest('health');
```

### 3. Manual Testing
```javascript
// Test authentication
import authService from './services/auth.service';

// Register user
await authService.register({
  email: 'test@example.com',
  username: 'testuser',
  password: 'Password123!',
  first_name: 'Test',
  last_name: 'User'
});

// Test properties
import propertyService from './services/property.service';
const properties = await propertyService.getProperties();
```

## 🔍 Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem**: `Access-Control-Allow-Origin` error
**Solution**: Check CORS settings in backend
```python
# core/config/settings/base.py
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
```

#### 2. Authentication Errors
**Problem**: 401 Unauthorized errors
**Solution**: Check token storage and refresh logic
```javascript
// Verify token exists
console.log(localStorage.getItem('accessToken'));
```

#### 3. Connection Refused
**Problem**: `ERR_CONNECTION_REFUSED`
**Solution**: Ensure backend is running on correct port
```bash
# Start backend
python manage.py runserver 0.0.0.0:8000
```

#### 4. Network Errors
**Problem**: `Network Error` in Axios
**Solution**: Check API base URL and network connectivity
```javascript
// Verify API URL
console.log(api.defaults.baseURL);
```

### Debug Tools

#### 1. Browser DevTools
```javascript
// Network tab - check API requests
// Console tab - check for errors
// Application tab - check localStorage tokens
```

#### 2. API Status Component
```jsx
import APIStatus from './components/common/APIStatus';

// Add to your app
<APIStatus showDetails={true} />
```

#### 3. Request Logging
```javascript
// Enable in development
if (process.env.NODE_ENV === 'development') {
  console.log('API Request:', request);
  console.log('API Response:', response);
}
```

## 🚀 Deployment Considerations

### Production Configuration

#### Frontend
```bash
# Build for production
npm run build

# Environment variables
REACT_APP_API_URL=https://api.yourdomain.com/api/v1
NODE_ENV=production
```

#### Backend
```python
# Production settings
DEBUG=False
ALLOWED_HOSTS=['api.yourdomain.com']
CORS_ALLOWED_ORIGINS=['https://yourdomain.com']
```

### Security Considerations

#### 1. HTTPS Only
```javascript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production' && window.location.protocol === 'http:') {
  window.location.replace(window.location.href.replace('http:', 'https:'));
}
```

#### 2. Token Security
```javascript
// Secure token storage
const isSecure = process.env.NODE_ENV === 'production';
if (isSecure) {
  // Use httpOnly cookies in production
}
```

#### 3. API Rate Limiting
```python
# Backend rate limiting
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_RATES': {
        'user': '1000/hour',
        'anon': '100/hour',
    }
}
```

## 📊 Performance Monitoring

### Frontend Metrics
```javascript
// Response time tracking
const startTime = performance.now();
await api.get('/properties/');
const endTime = performance.now();
console.log(`API Response Time: ${endTime - startTime}ms`);
```

### Backend Metrics
```python
# Request logging
LOGGING = {
    'loggers': {
        'django.request': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    }
}
```

## 🔄 Real-time Features

### WebSocket Connection (Future)
```javascript
// For real-time notifications
const ws = new WebSocket('ws://localhost:8000/ws/notifications/');
ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  // Handle real-time notification
};
```

## 📱 Mobile Considerations

### Responsive API
```javascript
// Mobile-specific headers
if (window.innerWidth <= 768) {
  api.defaults.headers['X-Mobile'] = 'true';
}
```

### Offline Support
```javascript
// Service worker for offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

## 🎯 Best Practices

### 1. Error Boundaries
```jsx
// Handle API errors gracefully
<ErrorBoundary>
  <PropertyList />
</ErrorBoundary>
```

### 2. Loading States
```jsx
// Show loading during API calls
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);

const fetchData = async () => {
  setLoading(true);
  try {
    const result = await api.get('/properties/');
    setData(result.data);
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
};
```

### 3. Caching
```javascript
// Cache API responses
const cache = new Map();

const getCachedData = async (url) => {
  if (cache.has(url)) {
    return cache.get(url);
  }
  
  const response = await api.get(url);
  cache.set(url, response.data);
  return response.data;
};
```

## 🔧 Development Tools

### 1. API Documentation
- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`

### 2. Testing Tools
- API Integration Test: `src/utils/api-integration-test.js`
- API Status Component: `src/components/common/APIStatus.jsx`

### 3. Debug Tools
- React DevTools
- Redux DevTools
- Browser Network Tab
- Postman/Insomnia for API testing

---

## ✅ Connection Checklist

- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:3000`
- [ ] CORS configured correctly
- [ ] JWT authentication working
- [ ] API endpoints accessible
- [ ] Error handling implemented
- [ ] Token refresh working
- [ ] Health check passing
- [ ] Integration tests passing
- [ ] Production configuration ready

---

**🎉 Your frontend and backend are now fully connected!**
