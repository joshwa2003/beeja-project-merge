const axios = require('axios');

// Test the notification sending API with the fix
async function testNotificationSending() {
    const baseURL = 'http://localhost:5001';
    
    // First, login to get admin token
    console.log('🔐 Logging in as admin...');
    try {
        const loginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
            email: 'hariharish2604@gmail.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        
        // Test 1: Send notification to all users
        console.log('\n📢 Test 1: Sending notification to all users...');
        const allUsersResponse = await axios.post(
            `${baseURL}/api/v1/admin/notifications/send`,
            {
                title: 'Test Notification - All Users',
                message: 'This is a test notification sent to all users to verify the fix.',
                recipients: 'all',
                priority: 'medium'
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('✅ All users notification sent successfully:', allUsersResponse.data);
        
        // Test 2: Send notification to students only
        console.log('\n📢 Test 2: Sending notification to students...');
        const studentsResponse = await axios.post(
            `${baseURL}/api/v1/admin/notifications/send`,
            {
                title: 'Test Notification - Students',
                message: 'This is a test notification sent to students only.',
                recipients: 'students',
                priority: 'high'
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('✅ Students notification sent successfully:', studentsResponse.data);
        
        // Test 3: Get all users to test specific user selection
        console.log('\n👥 Getting all users for specific user test...');
        const usersResponse = await axios.get(`${baseURL}/api/v1/admin/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const users = usersResponse.data.users;
        console.log(`✅ Found ${users.length} users`);
        
        // Test 4: Send notification to specific users (this was the problematic scenario)
        if (users.length > 0) {
            const selectedUserIds = users.slice(0, Math.min(2, users.length)).map(user => user._id);
            console.log('\n📢 Test 3: Sending notification to specific users...');
            console.log('Selected user IDs:', selectedUserIds);
            
            const specificUsersResponse = await axios.post(
                `${baseURL}/api/v1/admin/notifications/send`,
                {
                    title: 'Test Notification - Specific Users',
                    message: 'This is a test notification sent to specific selected users.',
                    recipients: 'specific',
                    selectedUsers: selectedUserIds,
                    priority: 'low'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('✅ Specific users notification sent successfully:', specificUsersResponse.data);
        }
        
        // Test 5: Test with invalid user IDs (edge case)
        console.log('\n📢 Test 4: Testing with invalid user IDs...');
        try {
            await axios.post(
                `${baseURL}/api/v1/admin/notifications/send`,
                {
                    title: 'Test Notification - Invalid IDs',
                    message: 'This should fail gracefully.',
                    recipients: 'specific',
                    selectedUsers: ['invalid_id_123', 'another_invalid_id'],
                    priority: 'medium'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (error) {
            console.log('✅ Invalid user IDs handled correctly:', error.response?.data?.message || error.message);
        }
        
        // Test 6: Get all notifications to verify they were created
        console.log('\n📋 Getting all notifications...');
        const notificationsResponse = await axios.get(`${baseURL}/api/v1/admin/notifications`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Notifications retrieved:', notificationsResponse.data.data.length, 'notifications found');
        
        console.log('\n🎉 All tests completed successfully! The notification sending fix is working.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('Error details:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Run the test
testNotificationSending();
