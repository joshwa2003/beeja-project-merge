const axios = require('axios');

// Test the delete notification API endpoint
const testDeleteAPI = async () => {
    try {
        const baseURL = 'http://localhost:5001/api/v1';
        
        // First, get all notifications to find one to delete
        console.log('Fetching notifications...');
        const getResponse = await axios.get(`${baseURL}/admin/notifications`, {
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhhcmloYXJpc2gyNjA0QGdtYWlsLmNvbSIsImlkIjoiNjg0MTMzOTk2NTY0OWMyNTkzZjg2ZTBkIiwiYWNjb3VudFR5cGUiOiJBZG1pbiIsImlhdCI6MTc1MDU5NTE4NSwiZXhwIjoxNzUwNjgxNTg1fQ.v1cs7UNdyE1F-GkEjX52EhE0Z0cCw4-w0u8tK3SULyA'
            }
        });
        
        console.log('Get notifications response status:', getResponse.status);
        console.log('Number of notifications:', getResponse.data.data?.length || 0);
        
        if (getResponse.data.data && getResponse.data.data.length > 0) {
            const notificationToDelete = getResponse.data.data[0];
            const notificationId = notificationToDelete.displayId || notificationToDelete._id;
            
            console.log('\nTesting delete with notification:');
            console.log('ID:', notificationId);
            console.log('Title:', notificationToDelete.title);
            
            // Test the delete endpoint
            console.log('\nAttempting to delete notification...');
            const deleteResponse = await axios.delete(`${baseURL}/admin/notifications/${notificationId}`, {
                headers: {
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhhcmloYXJpc2gyNjA0QGdtYWlsLmNvbSIsImlkIjoiNjg0MTMzOTk2NTY0OWMyNTkzZjg2ZTBkIiwiYWNjb3VudFR5cGUiOiJBZG1pbiIsImlhdCI6MTc1MDU5NTE4NSwiZXhwIjoxNzUwNjgxNTg1fQ.v1cs7UNdyE1F-GkEjX52EhE0Z0cCw4-w0u8tK3SULyA'
                }
            });
            
            console.log('Delete response status:', deleteResponse.status);
            console.log('Delete response:', deleteResponse.data);
            
        } else {
            console.log('No notifications found to test deletion');
        }
        
    } catch (error) {
        console.error('Test failed:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
        
        if (error.response?.status === 500) {
            console.error('\nServer error details:', error.response.data);
        }
    }
};

testDeleteAPI();
