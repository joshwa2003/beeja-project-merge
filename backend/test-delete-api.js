const axios = require('axios');

async function testDeleteNotification() {
    try {
        const notificationId = '6857e1902b177b24723df95f';
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhhcmloYXJpc2gyNjA0QGdtYWlsLmNvbSIsImlkIjoiNjg0MTMzOTk2NTY0OWMyNTkzZjg2ZTBkIiwiYWNjb3VudFR5cGUiOiJBZG1pbiIsImlhdCI6MTc1MDU4NDMxMiwiZXhwIjoxNzUwNjcwNzEyfQ.4GnyCpkdm12b8tfX24Qlz5Gyf_JH-JTBF_IFLfNt0NY';

        console.log('Testing delete notification API...');
        console.log('Notification ID:', notificationId);
        console.log('Token:', token.substring(0, 50) + '...');

        const response = await axios({
            method: 'DELETE',
            url: `http://localhost:5001/api/v1/admin/notifications/${notificationId}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response:', {
            status: response.status,
            data: response.data
        });

    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            stack: error.stack
        });

        // Log the full error response for debugging
        if (error.response) {
            console.log('Full error response:', {
                status: error.response.status,
                statusText: error.response.statusText,
                headers: error.response.headers,
                data: error.response.data
            });
        }
    }
}

// Run the test
testDeleteNotification();
