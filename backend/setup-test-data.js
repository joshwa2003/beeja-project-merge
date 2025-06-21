require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Import models
const User = require('./models/user');
const Profile = require('./models/profile');
const Course = require('./models/course');
const Category = require('./models/category');

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

async function setupTestData() {
    try {
        console.log('🚀 Setting up test data for frontend testing...');
        
        // Connect to database
        await connectDB();
        
        // Check if admin user already exists
        const existingAdmin = await User.findOne({ email: 'admin@example.com' });
        if (existingAdmin) {
            console.log('✓ Admin user already exists');
        } else {
            // Create admin user
            const adminProfile = await Profile.create({
                gender: null,
                dateOfBirth: null,
                about: 'Test Admin User for Frontend Testing',
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
        }

        // Check if instructor user already exists
        const existingInstructor = await User.findOne({ email: 'instructor@example.com' });
        if (existingInstructor) {
            console.log('✓ Instructor user already exists');
        } else {
            // Create instructor user
            const instructorProfile = await Profile.create({
                gender: null,
                dateOfBirth: null,
                about: 'Test Instructor User for Frontend Testing',
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
        }

        // Check if student user already exists
        const existingStudent = await User.findOne({ email: 'student@example.com' });
        if (existingStudent) {
            console.log('✓ Student user already exists');
        } else {
            // Create student user
            const studentProfile = await Profile.create({
                gender: null,
                dateOfBirth: null,
                about: 'Test Student User for Frontend Testing',
                contactNumber: '1234567892'
            });

            const hashedStudentPassword = await bcrypt.hash('Student@123', 10);
            const student = await User.create({
                firstName: 'Test',
                lastName: 'Student',
                email: 'student@example.com',
                password: hashedStudentPassword,
                accountType: 'Student',
                additionalDetails: studentProfile._id,
                approved: true,
                active: true,
                image: 'https://api.dicebear.com/5.x/initials/svg?seed=Test Student'
            });
            console.log('✓ Student user created:', student.email);
        }

        // Check if test category already exists
        const existingCategory = await Category.findOne({ name: 'Web Development' });
        if (existingCategory) {
            console.log('✓ Test category already exists');
        } else {
            // Create test category
            const category = await Category.create({
                name: 'Web Development',
                description: 'Learn modern web development technologies'
            });
            console.log('✓ Test category created:', category.name);
        }

        // Get the instructor and category for course creation
        const instructor = await User.findOne({ email: 'instructor@example.com' });
        const category = await Category.findOne({ name: 'Web Development' });

        // Check if test courses already exist
        const existingCourse = await Course.findOne({ courseName: 'React.js Fundamentals' });
        if (existingCourse) {
            console.log('✓ Test courses already exist');
        } else {
            // Create test courses
            const course1 = await Course.create({
                courseName: 'React.js Fundamentals',
                courseDescription: 'Learn the fundamentals of React.js including components, state, and props',
                instructor: instructor._id,
                whatYouWillLearn: 'Build modern web applications with React.js',
                price: 99,
                tag: ['react', 'javascript', 'frontend'],
                category: category._id,
                thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500',
                status: 'Published',
                isVisible: true,
                instructions: ['Basic JavaScript knowledge required', 'Computer with internet connection'],
                createdAt: new Date(),
            });

            const course2 = await Course.create({
                courseName: 'Node.js Backend Development',
                courseDescription: 'Master backend development with Node.js and Express',
                instructor: instructor._id,
                whatYouWillLearn: 'Build scalable backend applications',
                price: 149,
                tag: ['nodejs', 'backend', 'javascript'],
                category: category._id,
                thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=500',
                status: 'Published',
                isVisible: true,
                instructions: ['JavaScript fundamentals required', 'Understanding of web concepts'],
                createdAt: new Date(),
            });

            // Add courses to instructor's courses list
            await User.findByIdAndUpdate(
                instructor._id,
                { $push: { courses: { $each: [course1._id, course2._id] } } }
            );

            // Add courses to category
            await Category.findByIdAndUpdate(
                category._id,
                { $push: { courses: { $each: [course1._id, course2._id] } } }
            );

            console.log('✓ Test courses created');
        }

        console.log('\n✅ Test data setup completed successfully!');
        console.log('\nLogin Credentials:');
        console.log('Admin: admin@example.com / Admin@123');
        console.log('Instructor: instructor@example.com / Instructor@123');
        console.log('Student: student@example.com / Student@123');
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the setup
setupTestData();
