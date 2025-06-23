const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testFaqEndpoints() {
    console.log('Testing FAQ endpoints...\n');

    try {
        // Test 1: Get published FAQs (should work without auth)
        console.log('1. Testing GET /api/v1/faqs/published');
        const publishedResponse = await axios.get(`${BASE_URL}/api/v1/faqs/published`);
        console.log('✅ Published FAQs endpoint working');
        console.log('Response:', publishedResponse.data);
    } catch (error) {
        console.log('❌ Published FAQs endpoint failed');
        console.log('Error:', error.response?.status, error.response?.statusText);
        console.log('Data:', error.response?.data);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    try {
        // Test 2: Test server health
        console.log('2. Testing server health');
        const healthResponse = await axios.get(`${BASE_URL}/`);
        console.log('✅ Server is running');
        console.log('Response:', healthResponse.data);
    } catch (error) {
        console.log('❌ Server health check failed');
        console.log('Error:', error.message);
    }
}

testFaqEndpoints();
