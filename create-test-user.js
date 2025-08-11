const axios = require('axios');

async function createTestUser() {
  try {
    // First, let's create a new user with a different email
    const signupResponse = await axios.post('http://localhost:4000/api/user/signup', {
      email: 'teststudent@example.com',
      password: 'password123',
      role: 'STUDENT'
    });
    
    console.log('New user created:', signupResponse.data);
    
    // Now login with this user
    const loginResponse = await axios.post('http://localhost:4000/api/user/login', {
      email: 'teststudent@example.com',
      password: 'password123'
    });
    
    console.log('Login successful');
    const token = loginResponse.data.token;
    
    // Test eligibility
    const eligibilityResponse = await axios.get('http://localhost:4000/api/eligibility/check', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Eligibility result:');
    console.log(JSON.stringify(eligibilityResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

createTestUser(); 