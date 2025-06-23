const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testTogglePublish() {
    console.log('Testing FAQ toggle publish endpoint...');
    
    try {
        // First get all FAQs to find one to toggle
        console.log('\n1. Getting all FAQs to find one to toggle');
        const getAllResponse = await axios.get(`${BASE_URL}/api/v1/faqs/published`);
        console.log('Published FAQs:', getAllResponse.data);
        
        if (getAllResponse.data.faqs && getAllResponse.data.faqs.length > 0) {
            const faqId = getAllResponse.data.faqs[0]._id;
            console.log('\n2. Testing toggle publish for FAQ ID:', faqId);
            
            try {
                const response = await axios.put(`${BASE_URL}/api/v1/faqs/toggle-publish/${faqId}`, {}, {
                    headers: {
                        'Authorization': 'Bearer sample-token',
                        'Content-Type': 'application/json'
                    }
                });
                console.log('✅ Toggle response:', response.data);
            } catch (error) {
                console.log('❌ Toggle error:', error.response?.data || error.message);
                console.log('Error status:', error.response?.status);
                console.log('Error headers:', error.response?.headers);
            }
        } else {
            console.log('No FAQs found to test toggle');
        }

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testTogglePublish();
