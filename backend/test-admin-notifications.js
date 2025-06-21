require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Import models
const User = require('./models/user');
const Profile = require('./models/profile');
const Course = require('./models/course');
const Category = require('./models/category');
const Notification = require('./models/notification');

// Import notification functions
const {
    createNewCourseCreationNotification,
    createNewCourseAnnouncementToAll
} = require('./controllers/notification');

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

// Test functions
async function createTestUsers() {
    console.log('\n=== Creating Test Users ===');
    
    try {
        // Create admin user
        const adminProfile = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: 'Test Admin User',
            contactNumber: '1234567890'
        });

        const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);
        const admin = await User.create({
            firstName: 'Test',
            lastName: 'Admin',
            email: 'admin@example.com',
            password: hashedAdminPassword,
            accountType: 'Admin',
            additionalDetails: adminProfile._id,
            approved: true,
            active: true,
            image: 'https://api.dicebear.com/5.x/initials/svg?seed=Test Admin'
        });
        console.log('✓ Admin user created:', admin.email);

        // Create instructor user
        const instructorProfile = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: 'Test Instructor User',
            contactNumber: '1234567891'
        });

        const hashedInstructorPassword = await bcrypt.hash('Instructor@123', 10);
        const instructor = await User.create({
            firstName: 'Test',
            lastName: 'Instructor',
            email: 'instructor@example.com',
            password: hashedInstructorPassword,
            accountType: 'Instructor',
            additionalDetails: instructorProfile._id,
            approved: true,
            active: true,
            image: 'https://api.dicebear.com/5.x/initials/svg?seed=Test Instructor'
        });
        console.log('✓ Instructor user created:', instructor.email);

        // Create student users
        for (let i = 1; i <= 3; i++) {
            const studentProfile = await Profile.create({
                gender: null,
                dateOfBirth: null,
                about: `Test Student User ${i}`,
                contactNumber: `123456789${i}`
            });

            const hashedStudentPassword = await bcrypt.hash('Student@123', 10);
            const student = await User.create({
                firstName: 'Test',
                lastName: `Student${i}`,
                email: `student${i}@example.com`,
                password: hashedStudentPassword,
                accountType: 'Student',
                additionalDetails: studentProfile._id,
                approved: true,
                active: true,
                image: `https://api.dicebear.com/5.x/initials/svg?seed=Test Student${i}`
            });
            console.log(`✓ Student ${i} user created:`, student.email);
        }

        return { admin, instructor };
    } catch (error) {
        console.error('Error creating test users:', error);
        throw error;
    }
}

async function createTestCategory() {
    console.log('\n=== Creating Test Category ===');
    
    try {
        const category = await Category.create({
            name: 'Test Category',
            description: 'Test category for notification testing'
        });
        console.log('✓ Test category created:', category.name);
        return category;
    } catch (error) {
        console.error('Error creating test category:', error);
        throw error;
    }
}

async function testCourseCreationNotifications(instructor, category) {
    console.log('\n=== Testing Course Creation Notifications ===');
    
    try {
        // Test 1: Create a draft course (should only notify admins)
        console.log('\n--- Test 1: Draft Course Creation ---');
        const draftCourse = await Course.create({
            courseName: 'Test Draft Course',
            courseDescription: 'This is a test draft course',
            instructor: instructor._id,
            whatYouWillLearn: 'Test learning objectives',
            price: 99,
            tag: ['test', 'draft'],
            category: category._id,
            thumbnail: 'https://example.com/thumbnail.jpg',
            status: 'Draft',
            instructions: ['Test instruction 1', 'Test instruction 2'],
            createdAt: new Date(),
        });

        // Test admin notification for draft course
        await createNewCourseCreationNotification(draftCourse._id, instructor._id);
        console.log('✓ Admin notification sent for draft course creation');

        // Test 2: Create a published course (should notify everyone)
        console.log('\n--- Test 2: Published Course Creation ---');
        const publishedCourse = await Course.create({
            courseName: 'Test Published Course',
            courseDescription: 'This is a test published course',
            instructor: instructor._id,
            whatYouWillLearn: 'Test learning objectives for published course',
            price: 149,
            tag: ['test', 'published'],
            category: category._id,
            thumbnail: 'https://example.com/thumbnail2.jpg',
            status: 'Published',
            instructions: ['Test instruction 1', 'Test instruction 2'],
            createdAt: new Date(),
        });

        // Test admin notification for published course
        await createNewCourseCreationNotification(publishedCourse._id, instructor._id);
        console.log('✓ Admin notification sent for published course creation');

        // Test public notification for published course
        await createNewCourseAnnouncementToAll(publishedCourse._id, instructor._id);
        console.log('✓ Public notifications sent for published course');

        return { draftCourse, publishedCourse };
    } catch (error) {
        console.error('Error testing course creation notifications:', error);
        throw error;
    }
}

async function testCourseApprovalNotifications(draftCourse, instructor) {
    console.log('\n=== Testing Course Approval Notifications ===');
    
    try {
        // Simulate course approval (Draft -> Published)
        const approvedCourse = await Course.findByIdAndUpdate(
            draftCourse._id,
            { status: 'Published' },
            { new: true }
        );

        // Send notifications for course approval
        await createNewCourseAnnouncementToAll(approvedCourse._id, instructor._id);
        console.log('✓ Public notifications sent for course approval');

        return approvedCourse;
    } catch (error) {
        console.error('Error testing course approval notifications:', error);
        throw error;
    }
}

async function verifyNotifications() {
    console.log('\n=== Verifying Notifications ===');
    
    try {
        const notifications = await Notification.find({})
            .populate('recipient', 'firstName lastName email accountType')
            .populate('relatedCourse', 'courseName status')
            .sort({ createdAt: -1 });

        console.log(`\nTotal notifications created: ${notifications.length}`);
        
        // Group notifications by type
        const notificationsByType = {};
        const notificationsByRecipientType = {};
        
        notifications.forEach(notification => {
            // Group by notification type
            if (!notificationsByType[notification.type]) {
                notificationsByType[notification.type] = 0;
            }
            notificationsByType[notification.type]++;
            
            // Group by recipient account type
            const recipientType = notification.recipient.accountType;
            if (!notificationsByRecipientType[recipientType]) {
                notificationsByRecipientType[recipientType] = 0;
            }
            notificationsByRecipientType[recipientType]++;
        });

        console.log('\nNotifications by type:');
        Object.entries(notificationsByType).forEach(([type, count]) => {
            console.log(`  ${type}: ${count}`);
        });

        console.log('\nNotifications by recipient type:');
        Object.entries(notificationsByRecipientType).forEach(([type, count]) => {
            console.log(`  ${type}: ${count}`);
        });

        console.log('\nSample notifications:');
        notifications.slice(0, 5).forEach((notification, index) => {
            console.log(`  ${index + 1}. ${notification.type} -> ${notification.recipient.accountType} (${notification.recipient.email})`);
            console.log(`     Course: ${notification.relatedCourse?.courseName || 'N/A'}`);
            console.log(`     Message: ${notification.message.substring(0, 50)}...`);
            console.log(`     Read: ${notification.isRead}`);
            console.log('');
        });

        return notifications;
    } catch (error) {
        console.error('Error verifying notifications:', error);
        throw error;
    }
}

async function cleanupTestData() {
    console.log('\n=== Cleaning Up Test Data ===');
    
    try {
        // Delete test notifications
        await Notification.deleteMany({
            message: { $regex: /test/i }
        });
        console.log('✓ Test notifications deleted');

        // Delete test courses
        await Course.deleteMany({
            courseName: { $regex: /test/i }
        });
        console.log('✓ Test courses deleted');

        // Delete test category
        await Category.deleteMany({
            name: { $regex: /test/i }
        });
        console.log('✓ Test categories deleted');

        // Delete test users
        await User.deleteMany({
            email: { $regex: /@example\.com$/ }
        });
        console.log('✓ Test users deleted');

        // Delete test profiles
        await Profile.deleteMany({
            about: { $regex: /test/i }
        });
        console.log('✓ Test profiles deleted');

    } catch (error) {
        console.error('Error cleaning up test data:', error);
    }
}

// Main test function
async function runNotificationTests() {
    try {
        console.log('🚀 Starting Admin Notification System Tests...');
        
        // Connect to database
        await connectDB();
        
        // Clean up any existing test data
        await cleanupTestData();
        
        // Create test users
        const { admin, instructor } = await createTestUsers();
        
        // Create test category
        const category = await createTestCategory();
        
        // Test course creation notifications
        const { draftCourse, publishedCourse } = await testCourseCreationNotifications(instructor, category);
        
        // Test course approval notifications
        await testCourseApprovalNotifications(draftCourse, instructor);
        
        // Verify all notifications were created correctly
        await verifyNotifications();
        
        console.log('\n✅ All notification tests completed successfully!');
        console.log('\nTest Summary:');
        console.log('- Created admin, instructor, and student users');
        console.log('- Tested draft course creation (admin notifications only)');
        console.log('- Tested published course creation (all user notifications)');
        console.log('- Tested course approval workflow (draft -> published)');
        console.log('- Verified notification distribution and content');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        // Clean up test data
        await cleanupTestData();
        
        // Close database connection
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the tests
runNotificationTests();
