require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/course');
const Notification = require('./models/notification');
const User = require('./models/user');

async function testNotifications() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/learnhub");
        console.log('Connected to MongoDB');
        
        // Check latest course
        const latestCourse = await Course.findOne().sort({createdAt: -1}).populate('instructor', 'firstName lastName');
        console.log('\n=== Latest Course ===');
        if (latestCourse) {
            console.log(`Course: ${latestCourse.courseName}`);
            console.log(`Status: ${latestCourse.status}`);
            console.log(`Instructor: ${latestCourse.instructor?.firstName} ${latestCourse.instructor?.lastName}`);
            console.log(`Created: ${latestCourse.createdAt}`);
        } else {
            console.log('No courses found');
        }
        
        // Check notifications
        const notifications = await Notification.find({})
            .populate('recipient', 'firstName lastName email accountType')
            .sort({createdAt: -1})
            .limit(10);
        
        console.log('\n=== Recent Notifications ===');
        if (notifications.length > 0) {
            notifications.forEach((notif, index) => {
                console.log(`${index + 1}. ${notif.recipient?.firstName} ${notif.recipient?.lastName} (${notif.recipient?.accountType})`);
                console.log(`   Title: ${notif.title}`);
                console.log(`   Message: ${notif.message}`);
                console.log(`   Type: ${notif.type}`);
                console.log(`   Created: ${notif.createdAt}`);
                console.log('');
            });
        } else {
            console.log('No notifications found');
        }
        
        const totalCount = await Notification.countDocuments({});
        console.log(`Total notifications in database: ${totalCount}`);
        
        // Check user counts
        const studentCount = await User.countDocuments({ accountType: 'Student', active: true });
        const instructorCount = await User.countDocuments({ accountType: 'Instructor', active: true });
        const adminCount = await User.countDocuments({ accountType: 'Admin', active: true });
        
        console.log('\n=== User Counts ===');
        console.log(`Students: ${studentCount}`);
        console.log(`Instructors: ${instructorCount}`);
        console.log(`Admins: ${adminCount}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testNotifications();
