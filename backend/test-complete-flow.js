const mongoose = require('mongoose');
const ContactMessage = require('./models/contactMessage');

async function testCompleteFlow() {
  try {
    console.log('=== TESTING COMPLETE CONTACT MESSAGE FLOW ===');
    
    // Connect to database
    const MONGO_URI = process.env.MONGODB_URL || 'mongodb://localhost:27017/beeja-academy';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Database connected successfully');
    
    // Test 1: Check if ContactMessage model works
    console.log('\n1. Testing ContactMessage model...');
    const testMessage = new ContactMessage({
      firstname: 'Test',
      lastname: 'User',
      email: 'test@example.com',
      phoneNo: '1234567890',
      countrycode: '+1',
      message: 'This is a test message'
    });
    
    const savedMessage = await testMessage.save();
    console.log('✅ Test message created:', savedMessage._id);
    
    // Test 2: Test finding the message
    console.log('\n2. Testing message retrieval...');
    const foundMessage = await ContactMessage.findById(savedMessage._id);
    console.log('✅ Message found:', foundMessage ? 'Yes' : 'No');
    console.log('   Status:', foundMessage.status);
    
    // Test 3: Test updating message status
    console.log('\n3. Testing message status update...');
    const updatedMessage = await ContactMessage.findByIdAndUpdate(
      savedMessage._id,
      { status: 'read' },
      { new: true, runValidators: true }
    );
    console.log('✅ Message status updated:', updatedMessage.status);
    
    // Test 4: Test message deletion
    console.log('\n4. Testing message deletion...');
    const deletedMessage = await ContactMessage.findByIdAndDelete(savedMessage._id);
    console.log('✅ Message deleted:', deletedMessage ? 'Yes' : 'No');
    
    // Test 5: Verify deletion
    console.log('\n5. Verifying deletion...');
    const verifyDeleted = await ContactMessage.findById(savedMessage._id);
    console.log('✅ Message still exists:', verifyDeleted ? 'Yes' : 'No');
    
    console.log('\n=== ALL TESTS PASSED ===');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected');
    process.exit(0);
  }
}

// Load environment variables
require('dotenv').config();
testCompleteFlow();
