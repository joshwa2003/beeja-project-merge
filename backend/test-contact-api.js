const axios = require('axios');

async function testContactAPI() {
  const baseURL = 'http://localhost:5001';
  const messageId = '68580b73b6b46b93c0030cda';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhhcmloYXJpc2gyNjA0QGdtYWlsLmNvbSIsImlkIjoiNjg0MTMzOTk2NTY0OWMyNTkzZjg2ZTBkIiwiYWNjb3VudFR5cGUiOiJBZG1pbiIsImlhdCI6MTc1MDU5NTE4NSwiZXhwIjoxNzUwNjgxNTg1fQ.v1cs7UNdyE1F-GkEjX52EhE0Z0cCw4-w0u8tK3SULyA';

  console.log('Testing Contact Message API...');
  console.log('Base URL:', baseURL);
  console.log('Message ID:', messageId);
  console.log('Token preview:', token.substring(0, 50) + '...');

  try {
    // Test 1: Check if server is running
    console.log('\n1. Testing server health...');
    const healthResponse = await axios.get(`${baseURL}/`);
    console.log('Server is running:', healthResponse.status === 200);

    // Test 2: Test mark as read endpoint
    console.log('\n2. Testing mark as read endpoint...');
    const markReadResponse = await axios.patch(
      `${baseURL}/api/v1/contact/messages/${messageId}/mark-read`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Mark as read success:', markReadResponse.data);

  } catch (error) {
    console.error('\nError occurred:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Error Data:', error.response?.data);
    console.error('Error Message:', error.message);
    
    if (error.response?.status === 500) {
      console.error('This is a server error. Check the backend logs.');
    }
  }

  try {
    // Test 3: Test delete endpoint
    console.log('\n3. Testing delete endpoint...');
    const deleteResponse = await axios.delete(
      `${baseURL}/api/v1/contact/messages/${messageId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Delete success:', deleteResponse.data);

  } catch (error) {
    console.error('\nDelete Error occurred:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Error Data:', error.response?.data);
    console.error('Error Message:', error.message);
  }
}

testContactAPI();
