const mongoose = require('mongoose');
const axios = require('axios');

// Test the delete endpoint directly
async function testDeleteEndpoint() {
    try {
        console.log('Testing delete endpoint...');
        
        // Test notification ID from the frontend logs
        const notificationId = '6857e1902b177b24723df95f';
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhhcmloYXJpc2gyNjA0QGdtYWlsLmNvbSIsImlkIjoiNjg0MTMzOTk2NTY0OWMyNTkzZjg2ZTBkIiwiYWNjb3VudFR5cGUiOiJBZG1pbiIsImlhdCI6MTc1MDU4NDMxMiwiZXhwIjoxNzUwNjcwNzEyfQ.4GnyCpkdm12b8tfX24Qlz5Gyf_JH-JTBF_IFLfNt0NY';
        
        const url = `http://localhost:5001/api/v1/admin/notifications/${notificationId}`;
        
        console.log('Making DELETE request to:', url);
        console.log('Using token:', token.substring(0, 50) + '...');
        
        const response = await axios.delete(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Success response:', response.data);
        
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
            method: error.config?.method
        });
        
        if (error.response?.data) {
            console.log('Server error response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testDeleteEndpoint();
