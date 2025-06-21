const mongoose = require('mongoose');
const Notification = require('./models/notification');

mongoose.connect('mongodb://localhost:27017/studynotion', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createNotificationsForCurrentUser() {
  try {
    // Use the user ID from the newly created test user
    const userId = '685699c8c9a3d9be7050dd62';
    
    console.log('Creating notifications for user ID:', userId);
    
    // Create test notifications for this specific user
    const notifications = [
      {
        recipient: new mongoose.Types.ObjectId(userId),
        type: 'COURSE_ENROLLMENT_CONFIRMATION',
        title: 'Welcome to JavaScript Fundamentals!',
        message: 'You have successfully enrolled in JavaScript Fundamentals. Start learning now!',
        priority: 'high',
        read: false
      },
      {
        recipient: new mongoose.Types.ObjectId(userId),
        type: 'NEW_CONTENT_ADDED',
        title: 'New Lesson Available',
        message: 'A new lesson "Advanced Functions" has been added to your course.',
        priority: 'medium',
        read: false
      },
      {
        recipient: new mongoose.Types.ObjectId(userId),
        type: 'COURSE_PROGRESS_MILESTONE',
        title: 'Progress Milestone Reached!',
        message: 'Congratulations! You have completed 50% of the course.',
        priority: 'medium',
        read: false
      }
    ];
    
    await Notification.deleteMany({ recipient: new mongoose.Types.ObjectId(userId) });
    const result = await Notification.insertMany(notifications);
    console.log('Created notifications:', result.length);
    
    // Verify notifications were created
    const count = await Notification.countDocuments({ recipient: new mongoose.Types.ObjectId(userId) });
    console.log('Total notifications for user:', count);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

createNotificationsForCurrentUser();
