const axios = require('axios');

// Test the exact same request format as the frontend
async function testExactFrontendCall() {
    try {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhhcmloYXJpc2gyNjA0QGdtYWlsLmNvbSIsImlkIjoiNjg0MTMzOTk2NTY0OWMyNTkzZjg2ZTBkIiwiYWNjb3VudFR5cGUiOiJBZG1pbiIsImlhdCI6MTc1MDU5NTE4NSwiZXhwIjoxNzUwNjgxNTg1fQ.v1cs7UNdyE1F-GkEjX52EhE0Z0cCw4-w0u8tK3SULyA';

        // Create a test notification first
        console.log('Creating a test notification...');
        const createResponse = await axios.post('http://localhost:5001/api/v1/admin/notifications/send', {
            title: 'Frontend Test Notification',
            message: 'This notification will be deleted via frontend simulation',
            recipients: 'all',
            priority: 'medium'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Create response status:', createResponse.status);
        const notificationId = createResponse.data.data.notificationId;
        console.log('Created notification ID:', notificationId);

        // Now test delete with exact frontend format
        console.log('\nTesting delete with exact frontend format...');
        
        // This is exactly how the frontend calls it based on the logs
        const deleteResponse = await axios({
            method: 'DELETE',
            url: `http://localhost:5001/api/v1/admin/notifications/${notificationId}`,
            data: null, // Frontend sends null as bodyData
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Delete response status:', deleteResponse.status);
        console.log('Delete response:', JSON.stringify(deleteResponse.data, null, 2));

    } catch (error) {
        console.error('Error occurred:');
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
        
        if (error.response?.data) {
            console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
        }
        
        // Log the exact error details
        if (error.response) {
            console.error('Response headers:', error.response.headers);
            console.error('Request config:', {
                method: error.config?.method,
                url: error.config?.url,
                headers: error.config?.headers,
                data: error.config?.data
            });
        }
    }
}

testExactFrontendCall();
