const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

// Test FAQ submission endpoint
async function testFaqSubmission() {
    console.log('Testing FAQ submission endpoint...');
    
    try {
        // First, let's test without authentication to see the error
        console.log('\n1. Testing POST /api/v1/faqs/ask without auth');
        try {
            const response = await axios.post(`${BASE_URL}/api/v1/faqs/ask`, {
                question: 'Test question without auth'
            });
            console.log('✅ Response:', response.data);
        } catch (error) {
            console.log('❌ Expected error (no auth):', error.response?.data || error.message);
        }

        // Test with a sample token (this will likely fail but shows us the auth flow)
        console.log('\n2. Testing POST /api/v1/faqs/ask with sample token');
        try {
            const response = await axios.post(`${BASE_URL}/api/v1/faqs/ask`, {
                question: 'Test question with auth'
            }, {
                headers: {
                    'Authorization': 'Bearer sample-token',
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Response:', response.data);
        } catch (error) {
            console.log('❌ Auth error:', error.response?.data || error.message);
        }

        // Test the published endpoint to make sure server is working
        console.log('\n3. Testing GET /api/v1/faqs/published (should work)');
        try {
            const response = await axios.get(`${BASE_URL}/api/v1/faqs/published`);
            console.log('✅ Published FAQs working:', response.data.success);
        } catch (error) {
            console.log('❌ Published FAQs error:', error.response?.data || error.message);
        }

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testFaqSubmission();
