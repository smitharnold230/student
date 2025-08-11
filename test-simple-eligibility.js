const axios = require('axios');

async function testEligibility() {
  try {
    // Login with the working password
    const loginResponse = await axios.post('http://localhost:4000/api/user/login', {
      email: 'student@example.com',
      password: 'password'
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

testEligibility(); 