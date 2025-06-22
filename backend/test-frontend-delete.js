const axios = require('axios');

// Test the exact same request the frontend is making
async function testFrontendDelete() {
    try {
        const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhhcmloYXJpc2gyNjA0QGdtYWlsLmNvbSIsImlkIjoiNjg0MTMzOTk2NTY0OWMyNTkzZjg2ZTBkIiwiYWNjb3VudFR5cGUiOiJBZG1pbiIsImlhdCI6MTc1MDU5NTE4NSwiZXhwIjoxNzUwNjgxNTg1fQ.v1cs7UNdyE1F-GkEjX52EhE0Z0cCw4-w0u8tK3SULyA';

        // First create a test notification
        console.log('Creating a test notification...');
        const createResponse = await axios.post('http://localhost:5001/api/v1/admin/notifications/send', {
            title: 'Test Delete Notification',
            message: 'This notification will be deleted immediately',
            recipients: 'all',
            priority: 'medium'
        }, {
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        console.log('Create response status:', createResponse.status);
        console.log('Create response:', JSON.stringify(createResponse.data, null, 2));

        // Now get notifications to find the one we just created
        console.log('\nGetting notifications...');
        const getResponse = await axios.get('http://localhost:5001/api/v1/admin/notifications', {
            headers: {
                'Authorization': token
            }
        });

        console.log('Get response status:', getResponse.status);
        console.log('Number of notifications:', getResponse.data.data?.length || 0);

        if (getResponse.data.data && getResponse.data.data.length > 0) {
            const notification = getResponse.data.data[0];
            console.log('\nTesting delete with notification:');
            console.log('ID:', notification._id);
            console.log('Title:', notification.title);

            // Now try to delete using the exact same endpoint as frontend
            console.log('\nAttempting to delete notification...');
            const deleteResponse = await axios.delete(`http://localhost:5001/api/v1/admin/notifications/${notification._id}`, {
                headers: {
                    'Authorization': token
                }
            });

            console.log('Delete response status:', deleteResponse.status);
            console.log('Delete response:', JSON.stringify(deleteResponse.data, null, 2));

            // Verify deletion
            console.log('\nVerifying deletion...');
            const verifyResponse = await axios.get('http://localhost:5001/api/v1/admin/notifications', {
                headers: {
                    'Authorization': token
                }
            });
            console.log('Notifications after deletion:', verifyResponse.data.data?.length || 0);

        } else {
            console.log('No notifications found after creation');
        }

    } catch (error) {
        console.error('Error occurred:');
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
        
        if (error.response?.data) {
            console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testFrontendDelete();
