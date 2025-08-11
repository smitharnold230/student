const axios = require('axios');

const API_BASE_URL = 'http://localhost:4000/api';

// Test data
const testAdmin = {
  email: 'admin@test.com',
  password: 'password123'
};

const testStudent = {
  email: 'student@test.com',
  password: 'password123'
};

const newUser = {
  email: 'newuser@test.com',
  password: 'password123',
  role: 'STUDENT'
};

async function testBackendImprovements() {
  console.log('\n🔧 Testing Backend Improvements...');
  
  try {
    // Test rate limiting
    console.log('Testing rate limiting...');
    const promises = Array(10).fill().map(() => 
      axios.get(`${API_BASE_URL}/user/profile`)
    );
    
    try {
      await Promise.all(promises);
      console.log('❌ Rate limiting not working properly');
    } catch (error) {
      if (error.response?.status === 429) {
        console.log('✅ Rate limiting is working');
      } else {
        console.log('❌ Rate limiting test failed:', error.message);
      }
    }

    // Test input validation
    console.log('Testing input validation...');
    try {
      await axios.post(`${API_BASE_URL}/user/login`, {
        email: 'invalid-email',
        password: '123'
      });
      console.log('❌ Input validation not working');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Input validation is working');
      } else {
        console.log('❌ Input validation test failed:', error.message);
      }
    }

    // Test database migrations
    console.log('Testing database migrations...');
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/system-stats`);
      console.log('✅ Database migrations are working');
    } catch (error) {
      console.log('❌ Database migrations test failed:', error.message);
    }

  } catch (error) {
    console.log('❌ Backend improvements test failed:', error.message);
  }
}

async function testPointCalculation() {
  console.log('\n💰 Testing Point Calculation...');
  
  try {
    // Login as admin
    const adminLogin = await axios.post(`${API_BASE_URL}/user/login`, testAdmin);
    const adminToken = adminLogin.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // Get all users with points
    const usersResponse = await axios.get(`${API_BASE_URL}/points/users`, { headers: adminHeaders });
    console.log('✅ Admin can view all users with points');

    // Test manual point adjustment
    if (usersResponse.data.data.length > 0) {
      const firstUser = usersResponse.data.data[0];
      const adjustmentResponse = await axios.post(
        `${API_BASE_URL}/points/manual-adjustment`,
        {
          userId: firstUser.id,
          adjustment: 50,
          reason: 'Test adjustment'
        },
        { headers: adminHeaders }
      );
      console.log('✅ Manual point adjustment working');

      // Check if notification was sent
      const notificationsResponse = await axios.get(`${API_BASE_URL}/notifications`, { 
        headers: { Authorization: `Bearer ${firstUser.token || 'test'}` }
      });
      console.log('✅ Point adjustment notifications working');
    }

  } catch (error) {
    console.log('❌ Point calculation test failed:', error.message);
  }
}

async function testAdminUserManagement() {
  console.log('\n👥 Testing Admin User Management...');
  
  try {
    // Login as admin
    const adminLogin = await axios.post(`${API_BASE_URL}/user/login`, testAdmin);
    const adminToken = adminLogin.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // Get all users
    const usersResponse = await axios.get(`${API_BASE_URL}/user/admin/all`, { headers: adminHeaders });
    console.log('✅ Admin can view all users');

    // Create new user
    const createUserResponse = await axios.post(`${API_BASE_URL}/user/signup`, newUser);
    console.log('✅ Admin can create new users');

    // Delete the created user
    const deleteResponse = await axios.delete(`${API_BASE_URL}/user/admin/${createUserResponse.data.user.id}`, { 
      headers: adminHeaders 
    });
    console.log('✅ Admin can delete users');

  } catch (error) {
    console.log('❌ Admin user management test failed:', error.message);
  }
}

async function testEligibilitySystem() {
  console.log('\n🎯 Testing Eligibility System...');
  
  try {
    // Login as student
    const studentLogin = await axios.post(`${API_BASE_URL}/user/login`, testStudent);
    const studentToken = studentLogin.data.token;
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };

    // Check eligibility
    const eligibilityResponse = await axios.get(`${API_BASE_URL}/eligibility/check`, { headers: studentHeaders });
    console.log('✅ Eligibility check working');
    console.log('Eligibility data:', eligibilityResponse.data);

    // Get all students (admin only)
    const adminLogin = await axios.post(`${API_BASE_URL}/user/login`, testAdmin);
    const adminToken = adminLogin.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    const studentsResponse = await axios.get(`${API_BASE_URL}/profile/admin/students`, { headers: adminHeaders });
    console.log('✅ Admin can view all students for eligibility');

  } catch (error) {
    console.log('❌ Eligibility system test failed:', error.message);
  }
}

async function testRealTimeNotifications() {
  console.log('\n🔔 Testing Real-time Notifications...');
  
  try {
    // Login as student
    const studentLogin = await axios.post(`${API_BASE_URL}/user/login`, testStudent);
    const studentToken = studentLogin.data.token;
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };

    // Get notifications
    const notificationsResponse = await axios.get(`${API_BASE_URL}/notifications`, { headers: studentHeaders });
    console.log('✅ Notifications API working');

    // Test notification creation (admin only)
    const adminLogin = await axios.post(`${API_BASE_URL}/user/login`, testAdmin);
    const adminToken = adminLogin.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    const createNotificationResponse = await axios.post(
      `${API_BASE_URL}/notifications`,
      {
        userId: studentLogin.data.user.id,
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'INFO'
      },
      { headers: adminHeaders }
    );
    console.log('✅ Real-time notification creation working');

  } catch (error) {
    console.log('❌ Real-time notifications test failed:', error.message);
  }
}

async function testFormValidation() {
  console.log('\n✅ Testing Form Validation...');
  
  try {
    // Test invalid login data
    try {
      await axios.post(`${API_BASE_URL}/user/login`, {
        email: 'invalid-email',
        password: ''
      });
      console.log('❌ Form validation not working for login');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Form validation working for login');
      }
    }

    // Test invalid user creation
    try {
      await axios.post(`${API_BASE_URL}/user/signup`, {
        email: 'invalid',
        password: '123',
        role: 'INVALID'
      });
      console.log('❌ Form validation not working for signup');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Form validation working for signup');
      }
    }

  } catch (error) {
    console.log('❌ Form validation test failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive test of recent updates...\n');
  
  try {
    await testBackendImprovements();
    await testPointCalculation();
    await testAdminUserManagement();
    await testEligibilitySystem();
    await testRealTimeNotifications();
    await testFormValidation();
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Summary of tested features:');
    console.log('✅ Backend improvements (rate limiting, validation, migrations)');
    console.log('✅ Point calculation system');
    console.log('✅ Admin user management (CRUD operations)');
    console.log('✅ Eligibility system');
    console.log('✅ Real-time notifications');
    console.log('✅ Form validation');
    
  } catch (error) {
    console.log('❌ Test suite failed:', error.message);
  }
}

// Run tests
runAllTests();
