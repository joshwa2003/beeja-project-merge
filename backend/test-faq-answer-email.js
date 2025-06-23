const axios = require('axios');

const BASE_URL = 'http://localhost:5001';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imd1cnVAYmVlamFhY2FkZW15LmNvbSIsImlkIjoiNjg0MmMyZDkzODZjYTRlYTdjZDdmMGMzIiwiYWNjb3VudFR5cGUiOiJJbnN0cnVjdG9yIiwiaWF0IjoxNzUwNjY3NzE4LCJleHAiOjE3NTA3NTQxMTh9.pbAxxR4NwY9K9HfDCtDO8N8OIxcIgRXcyYrBrqVdKsI';

async function testFaqAnswerEmail() {
    console.log('Testing FAQ answer with email notification...');
    
    try {
        // First get all FAQs to find an unanswered one
        console.log('\n1. Getting all FAQs');
        const getAllResponse = await axios.get(`${BASE_URL}/api/v1/faqs/all`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`
            }
        });
        
        const unansweredFaq = getAllResponse.data.faqs.find(faq => !faq.answer);
        
        if (unansweredFaq) {
            console.log('\n2. Found unanswered FAQ:', {
                id: unansweredFaq._id,
                question: unansweredFaq.question,
                userEmail: unansweredFaq.userId.email
            });
            
            // Answer the FAQ
            console.log('\n3. Answering FAQ');
            try {
                const response = await axios.put(
                    `${BASE_URL}/api/v1/faqs/answer/${unansweredFaq._id}`,
                    {
                        answer: "This is a test answer to verify email notification functionality."
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${TEST_TOKEN}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log('✅ Answer submitted successfully:', response.data);
                console.log('Check your email for the notification!');
            } catch (error) {
                console.log('❌ Error answering FAQ:', error.response?.data || error.message);
            }
        } else {
            console.log('No unanswered FAQs found. Create one first to test the email functionality.');
        }

    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) {
            console.error('Error response:', error.response.data);
        }
    }
}

testFaqAnswerEmail();
