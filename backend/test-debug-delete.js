const axios = require('axios');

// Test different body formats to identify the issue
async function testDebugDelete() {
    try {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhhcmloYXJpc2gyNjA0QGdtYWlsLmNvbSIsImlkIjoiNjg0MTMzOTk2NTY0OWMyNTkzZjg2ZTBkIiwiYWNjb3VudFR5cGUiOiJBZG1pbiIsImlhdCI6MTc1MDU5NTE4NSwiZXhwIjoxNzUwNjgxNTg1fQ.v1cs7UNdyE1F-GkEjX52EhE0Z0cCw4-w0u8tK3SULyA';

        // Create a test notification first
        console.log('Creating a test notification...');
        const createResponse = await axios.post('http://localhost:5001/api/v1/admin/notifications/send', {
            title: 'Debug Test Notification',
            message: 'This notification will be deleted for debugging',
            recipients: 'all',
            priority: 'medium'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const notificationId = createResponse.data.data.notificationId;
        console.log('Created notification ID:', notificationId);

        // Test 1: No body (this should work)
        console.log('\n=== Test 1: No body ===');
        try {
            const response1 = await axios.delete(`http://localhost:5001/api/v1/admin/notifications/${notificationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('✅ Success with no body:', response1.status);
        } catch (error) {
            console.log('❌ Failed with no body:', error.response?.status, error.response?.data);
        }

        // Create another notification for test 2
        const createResponse2 = await axios.post('http://localhost:5001/api/v1/admin/notifications/send', {
            title: 'Debug Test Notification 2',
            message: 'This notification will be deleted for debugging',
            recipients: 'all',
            priority: 'medium'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const notificationId2 = createResponse2.data.data.notificationId;

        // Test 2: With null body (this is what frontend sends)
        console.log('\n=== Test 2: With null body ===');
        try {
            const response2 = await axios({
                method: 'DELETE',
                url: `http://localhost:5001/api/v1/admin/notifications/${notificationId2}`,
                data: null,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Success with null body:', response2.status);
        } catch (error) {
            console.log('❌ Failed with null body:', error.response?.status, error.response?.data);
        }

        // Create another notification for test 3
        const createResponse3 = await axios.post('http://localhost:5001/api/v1/admin/notifications/send', {
            title: 'Debug Test Notification 3',
            message: 'This notification will be deleted for debugging',
            recipients: 'all',
            priority: 'medium'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const notificationId3 = createResponse3.data.data.notificationId;

        // Test 3: With undefined body
        console.log('\n=== Test 3: With undefined body ===');
        try {
            const response3 = await axios({
                method: 'DELETE',
                url: `http://localhost:5001/api/v1/admin/notifications/${notificationId3}`,
                data: undefined,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('✅ Success with undefined body:', response3.status);
        } catch (error) {
            console.log('❌ Failed with undefined body:', error.response?.status, error.response?.data);
        }

    } catch (error) {
        console.error('Setup error:', error.message);
    }
}

testDebugDelete();
