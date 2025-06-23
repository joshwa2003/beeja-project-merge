const axios = require('axios');

const BASE_URL = 'http://localhost:5001';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imd1cnVAYmVlamFhY2FkZW15LmNvbSIsImlkIjoiNjg0MmMyZDkzODZjYTRlYTdjZDdmMGMzIiwiYWNjb3VudFR5cGUiOiJJbnN0cnVjdG9yIiwiaWF0IjoxNzUwNjY3NzE4LCJleHAiOjE3NTA3NTQxMTh9.pbAxxR4NwY9K9HfDCtDO8N8OIxcIgRXcyYrBrqVdKsI';

async function testFaqOperations() {
    console.log('Testing FAQ operations...');
    
    try {
        // 1. Get all FAQs
        console.log('\n1. Getting all FAQs');
        const getAllResponse = await axios.get(`${BASE_URL}/api/v1/faqs/all`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`
            }
        });
        
        console.log(`Found ${getAllResponse.data.faqs.length} FAQs`);
        
        if (getAllResponse.data.faqs.length > 0) {
            const testFaq = getAllResponse.data.faqs[0];
            console.log(`\nTesting with FAQ: ${testFaq._id}`);
            console.log(`Question: ${testFaq.question}`);
            console.log(`Status: ${testFaq.status}`);
            console.log(`Published: ${testFaq.isPublished}`);
            
            // 2. Test toggle publish (if answered)
            if (testFaq.status === 'answered') {
                console.log('\n2. Testing toggle publish');
                try {
                    const toggleResponse = await axios.put(
                        `${BASE_URL}/api/v1/faqs/toggle-publish/${testFaq._id}`,
                        undefined, // No body
                        {
                            headers: {
                                'Authorization': `Bearer ${TEST_TOKEN}`
                            }
                        }
                    );
                    console.log('✅ Toggle publish successful:', toggleResponse.data.message);
                } catch (error) {
                    console.log('❌ Toggle publish failed:', error.response?.data || error.message);
                }
            }
            
            // 3. Test delete (use the last FAQ to avoid deleting important ones)
            const lastFaq = getAllResponse.data.faqs[getAllResponse.data.faqs.length - 1];
            console.log(`\n3. Testing delete with FAQ: ${lastFaq._id}`);
            try {
                const deleteResponse = await axios.delete(
                    `${BASE_URL}/api/v1/faqs/delete/${lastFaq._id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${TEST_TOKEN}`
                        }
                    }
                );
                console.log('✅ Delete successful:', deleteResponse.data.message);
            } catch (error) {
                console.log('❌ Delete failed:', error.response?.data || error.message);
            }
        }

    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) {
            console.error('Error response:', error.response.data);
        }
    }
}

testFaqOperations();
