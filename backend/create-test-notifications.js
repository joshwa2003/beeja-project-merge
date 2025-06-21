require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('./models/user');
const Course = require('./models/course');
const Notification = require('./models/notification');

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

async function createTestNotifications() {
    try {
        console.log('🚀 Creating test notifications...');
        
        // Connect to database
        await connectDB();
        
        // Get test users
        const admin = await User.findOne({ email: 'admin@example.com' });
        const instructor = await User.findOne({ email: 'instructor@example.com' });
        const student = await User.findOne({ email: 'student@example.com' });
        const course = await Course.findOne({ courseName: 'React.js Fundamentals' });

        if (!admin || !instructor || !student || !course) {
            console.log('❌ Test users or course not found. Please run setup-test-data.js first');
            return;
        }

        // Create test notifications for admin
        const adminNotifications = [
            {
                recipient: admin._id,
                type: 'NEW_COURSE_CREATION',
                title: 'New Course Created',
                message: `${instructor.firstName} ${instructor.lastName} created a new course "${course.courseName}"`,
                relatedCourse: course._id,
                relatedUser: instructor._id,
                priority: 'medium',
                actionUrl: `/admin/courses/${course._id}`,
                metadata: { createdAt: new Date() },
                read: false
            },
            {
                recipient: admin._id,
                type: 'NEW_USER_REGISTRATION',
                title: 'New User Registration',
                message: `${student.firstName} ${student.lastName} (Student) has registered`,
                relatedUser: student._id,
                priority: 'low',
                actionUrl: `/admin/users/${student._id}`,
                metadata: { userType: 'Student', registeredAt: new Date() },
                read: false
            },
            {
                recipient: admin._id,
                type: 'COURSE_MODIFICATION',
                title: 'Course Modified',
                message: `${instructor.firstName} ${instructor.lastName} made content changes to "${course.courseName}"`,
                relatedCourse: course._id,
                relatedUser: instructor._id,
                priority: 'low',
                actionUrl: `/admin/courses/${course._id}`,
                metadata: { modificationType: 'content', modifiedAt: new Date() },
                read: false
            }
        ];

        // Create test notifications for instructor
        const instructorNotifications = [
            {
                recipient: instructor._id,
                type: 'NEW_STUDENT_ENROLLMENT',
                title: 'New Student Enrollment',
                message: `${student.firstName} ${student.lastName} has enrolled in your course "${course.courseName}"`,
                relatedCourse: course._id,
                relatedUser: student._id,
                priority: 'medium',
                actionUrl: `/instructor/courses/${course._id}/students`,
                metadata: { enrollmentDate: new Date() },
                read: false
            },
            {
                recipient: instructor._id,
                type: 'NEW_RATING_ON_COURSE',
                title: 'New Course Rating',
                message: `Your course "${course.courseName}" received a 5-star rating with a review`,
                relatedCourse: course._id,
                priority: 'medium',
                actionUrl: `/instructor/courses/${course._id}/reviews`,
                metadata: { rating: 5, hasReview: true },
                read: false
            }
        ];

        // Create test notifications for student
        const studentNotifications = [
            {
                recipient: student._id,
                type: 'COURSE_ENROLLMENT_CONFIRMATION',
                title: 'Course Enrollment Confirmed',
                message: `You have successfully enrolled in "${course.courseName}". Start learning now!`,
                relatedCourse: course._id,
                priority: 'high',
                actionUrl: `/view-course/${course._id}`,
                metadata: { enrollmentDate: new Date() },
                read: false
            },
            {
                recipient: student._id,
                type: 'NEW_CONTENT_ADDED',
                title: 'New Content Available',
                message: `New content "Introduction to React Hooks" has been added to "${course.courseName}"`,
                relatedCourse: course._id,
                priority: 'medium',
                actionUrl: `/view-course/${course._id}`,
                metadata: { contentType: 'subsection' },
                read: false
            },
            {
                recipient: student._id,
                type: 'COURSE_PROGRESS_MILESTONE',
                title: 'Progress Milestone Reached!',
                message: `Congratulations! You've completed 50% of "${course.courseName}"`,
                relatedCourse: course._id,
                priority: 'medium',
                actionUrl: `/view-course/${course._id}`,
                metadata: { milestone: 50, achievedAt: new Date() },
                read: true // This one is read
            }
        ];

        // Insert all notifications
        const allNotifications = [...adminNotifications, ...instructorNotifications, ...studentNotifications];
        await Notification.insertMany(allNotifications);

        console.log(`✅ Created ${allNotifications.length} test notifications:`);
        console.log(`   - Admin: ${adminNotifications.length} notifications`);
        console.log(`   - Instructor: ${instructorNotifications.length} notifications`);
        console.log(`   - Student: ${studentNotifications.length} notifications`);

        // Show notification counts
        const adminUnread = await Notification.countDocuments({ recipient: admin._id, read: false });
        const instructorUnread = await Notification.countDocuments({ recipient: instructor._id, read: false });
        const studentUnread = await Notification.countDocuments({ recipient: student._id, read: false });

        console.log('\nUnread notification counts:');
        console.log(`   - Admin: ${adminUnread} unread`);
        console.log(`   - Instructor: ${instructorUnread} unread`);
        console.log(`   - Student: ${studentUnread} unread`);

    } catch (error) {
        console.error('❌ Error creating test notifications:', error);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the script
createTestNotifications();
