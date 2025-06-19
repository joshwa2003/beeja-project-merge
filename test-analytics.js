// Test the analytics endpoint
async function testAnalytics() {
    try {
        console.log('Testing analytics endpoint...');
        
        // Note: This will fail due to missing auth token, but we can see the response structure
        const response = await fetch('http://localhost:5001/api/v1/admin/analytics', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.text();
        console.log('Response status:', response.status);
        console.log('Response data:', data);
        
        // Test if server is responding
        if (response.status === 401) {
            console.log('✅ Server is responding (401 = authentication required, which is expected)');
        } else {
            console.log('Server response status:', response.status);
        }
        
    } catch (error) {
        console.error('❌ Error testing analytics:', error.message);
    }
}

testAnalytics();
