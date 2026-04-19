/**
 * API Integration Test Suite
 * Tests the connection between frontend and backend
 */

import authService from '../services/auth.service';
import propertyService from '../services/property.service';
import reservationService from '../services/reservation.service';

class APIIntegrationTest {
  constructor() {
    this.testResults = [];
    this.testUser = null;
    this.testProperty = null;
    this.testBooking = null;
  }

  // Test runner
  async runAllTests() {
    console.log('Starting API Integration Tests...\n');

    const tests = [
      this.testHealthCheck,
      this.testUserRegistration,
      this.testUserLogin,
      this.testGetCurrentUser,
      this.testGetProperties,
      this.testCreateProperty,
      this.testCreateApartment,
      this.testCreateBooking,
      this.testGetMyBookings,
      this.testUserLogout,
    ];

    for (const test of tests) {
      try {
        await test.call(this);
      } catch (error) {
        this.addResult(test.name, false, error.message);
      }
    }

    this.printResults();
    return this.testResults;
  }

  // Helper methods
  addResult(testName, passed, message = '') {
    this.testResults.push({
      test: testName,
      passed,
      message,
      timestamp: new Date().toISOString(),
    });
    
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}: ${message}`);
  }

  async makeRequest(requestName, requestFn) {
    try {
      const result = await requestFn();
      this.addResult(requestName, true, 'Success');
      return result;
    } catch (error) {
      this.addResult(requestName, false, error.message);
      throw error;
    }
  }

  // Test methods
  async testHealthCheck() {
    try {
      const response = await fetch('http://localhost:8000/health/');
      const data = await response.json();
      
      if (data.status === 'healthy') {
        this.addResult('Health Check', true, 'Backend is healthy');
      } else {
        this.addResult('Health Check', false, 'Backend not healthy');
      }
    } catch (error) {
      this.addResult('Health Check', false, 'Cannot connect to backend');
    }
  }

  async testUserRegistration() {
    const testUserData = {
      email: `test${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      password: 'TestPassword123!',
      first_name: 'Test',
      last_name: 'User',
      role: 'CLIENT',
    };

    try {
      const result = await authService.register(testUserData);
      this.testUser = result.user;
      this.addResult('User Registration', true, 'User registered successfully');
    } catch (error) {
      // If user already exists, try to login
      if (error.message?.includes('already exists')) {
        const loginResult = await authService.login(testUserData.email, testUserData.password);
        this.testUser = loginResult.user;
        this.addResult('User Registration', true, 'User already exists, logged in instead');
      } else {
        throw error;
      }
    }
  }

  async testUserLogin() {
    if (!this.testUser) {
      this.addResult('User Login', false, 'No test user available');
      return;
    }

    const result = await this.makeRequest('User Login', () =>
      authService.login(this.testUser.email, 'TestPassword123!')
    );
  }

  async testGetCurrentUser() {
    const result = await this.makeRequest('Get Current User', () =>
      authService.getCurrentUser()
    );
  }

  async testGetProperties() {
    const result = await this.makeRequest('Get Properties', () =>
      propertyService.getProperties()
    );
  }

  async testCreateProperty() {
    if (!this.testUser || this.testUser.role !== 'OWNER') {
      this.addResult('Create Property', false, 'User is not an owner');
      return;
    }

    const propertyData = {
      name: 'Test Property',
      type: 'apartment',
      description: 'A beautiful test property',
      address: '123 Test Street',
      city: 'Test City',
      country: 'Test Country',
      postal_code: '12345',
      amenities: ['WiFi', 'Parking', 'Pool'],
    };

    const result = await this.makeRequest('Create Property', () =>
      propertyService.createProperty(propertyData)
    );
    
    this.testProperty = result;
  }

  async testCreateApartment() {
    if (!this.testProperty) {
      this.addResult('Create Apartment', false, 'No test property available');
      return;
    }

    const apartmentData = {
      name: 'Test Apartment',
      property: this.testProperty.id,
      max_guests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 1,
      price_per_night: 100,
      cleaning_fee: 50,
      service_fee: 25,
      description: 'A cozy test apartment',
    };

    const result = await this.makeRequest('Create Apartment', () =>
      propertyService.createApartment(apartmentData)
    );
    
    this.testApartment = result;
  }

  async testCreateBooking() {
    if (!this.testApartment) {
      this.addResult('Create Booking', false, 'No test apartment available');
      return;
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    const bookingData = {
      apartment: this.testApartment.id,
      check_in: tomorrow.toISOString().split('T')[0],
      check_out: dayAfter.toISOString().split('T')[0],
      num_guests: 2,
      guest_first_name: 'Test',
      guest_last_name: 'Guest',
      guest_email: this.testUser.email,
      guest_phone: '+1234567890',
    };

    const result = await this.makeRequest('Create Booking', () =>
      reservationService.createBooking(bookingData)
    );
    
    this.testBooking = result;
  }

  async testGetMyBookings() {
    const result = await this.makeRequest('Get My Bookings', () =>
      reservationService.getMyBookings()
    );
  }

  async testUserLogout() {
    const result = await this.makeRequest('User Logout', () =>
      authService.logout()
    );
  }

  // Results and reporting
  printResults() {
    console.log('\nTest Results Summary:');
    console.log('========================');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => r.passed === false).length;
    const total = this.testResults.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\nFailed Tests:');
      this.testResults
        .filter(r => r.passed === false)
        .forEach(r => console.log(`  - ${r.test}: ${r.message}`));
    }
    
    console.log('\nAPI Integration Status:', failed === 0 ? 'SUCCESS' : 'FAILED');
  }

  // Individual test runner for debugging
  async runSingleTest(testName) {
    const testMap = {
      'health': this.testHealthCheck,
      'register': this.testUserRegistration,
      'login': this.testUserLogin,
      'profile': this.testGetCurrentUser,
      'properties': this.testGetProperties,
      'create-property': this.testCreateProperty,
      'create-apartment': this.testCreateApartment,
      'create-booking': this.testCreateBooking,
      'my-bookings': this.testGetMyBookings,
      'logout': this.testUserLogout,
    };

    if (testMap[testName]) {
      await testMap[testName].call(this);
      this.printResults();
    } else {
      console.error(`Unknown test: ${testName}`);
      console.log('Available tests:', Object.keys(testMap).join(', '));
    }
  }

  // Clean up test data
  async cleanup() {
    console.log('🧹 Cleaning up test data...');
    
    try {
      if (this.testBooking) {
        await reservationService.deleteBooking(this.testBooking.id);
        console.log('✅ Test booking deleted');
      }
      
      if (this.testApartment) {
        await propertyService.deleteApartment(this.testApartment.id);
        console.log('✅ Test apartment deleted');
      }
      
      if (this.testProperty) {
        await propertyService.deleteProperty(this.testProperty.id);
        console.log('✅ Test property deleted');
      }
      
      if (this.testUser) {
        await authService.logout();
        console.log('✅ Logged out test user');
      }
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
    }
  }
}

// Export for use in browser console or testing framework
window.APIIntegrationTest = APIIntegrationTest;

// Auto-run if in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('🧪 API Integration Test available');
  console.log('Run: new APIIntegrationTest().runAllTests()');
  console.log('Or run single test: new APIIntegrationTest().runSingleTest("health")');
}

export default APIIntegrationTest;
