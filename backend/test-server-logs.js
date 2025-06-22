const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB to test the ObjectId
async function testObjectId() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB');
        
        const testId = '6857e1902b177b24723df95f';
        console.log('Testing ObjectId:', testId);
        console.log('Is valid ObjectId:', mongoose.Types.ObjectId.isValid(testId));
        
        const objectId = new mongoose.Types.ObjectId(testId);
        console.log('Created ObjectId:', objectId);
        
        // Test finding a notification with this ID
        const Notification = require('./models/notification');
        const notification = await Notification.findById(testId);
        console.log('Found notification:', notification ? 'Yes' : 'No');
        
        if (notification) {
            console.log('Notification details:', {
                id: notification._id,
                title: notification.title,
                type: notification.type,
                bulkId: notification.bulkId
            });
        }
        
        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

testObjectId();
