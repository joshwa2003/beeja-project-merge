const axios = require('axios');

async function testSpecificUserNotification() {
    const baseURL = 'http://localhost:5001';
    
    try {
        // Login
        console.log('Logging in...');
        const loginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
            email: 'hariharish2604@gmail.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        console.log('Login successful, got token');

        // Get users first
        console.log('Getting users...');
        const usersResponse = await axios.get(`${baseURL}/api/v1/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const users = usersResponse.data.users;
        console.log(`Found ${users.length} users`);
        
        if (users.length > 0) {
            // Take first user as test
            const testUserId = users[0]._id;
            console.log(`Testing with user ID: ${testUserId}`);
            
            // Send notification to specific user
            console.log('Sending notification...');
            const notificationResponse = await axios.post(
                `${baseURL}/api/v1/admin/notifications/send`,
                {
                    title: 'Test Single User Notification',
                    message: 'Testing notification to single user',
                    recipients: 'specific',
                    selectedUsers: [testUserId],
                    priority: 'medium'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('Notification Response:', JSON.stringify(notificationResponse.data, null, 2));
        } else {
            console.log('No users found to test with');
        }
        
    } catch (error) {
        console.error('Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
    }
}

testSpecificUserNotification();
