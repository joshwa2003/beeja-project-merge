const User = require('../models/user');
const Course = require('../models/course');
const Profile = require('../models/profile');
const bcrypt = require('bcrypt');

const mongoose = require('mongoose');

// ================ TOGGLE USER STATUS ================
exports.toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        console.log('Toggle user status request:', { userId, body: req.body });

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }

        const user = await User.findById(userId).populate('additionalDetails');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.active = !user.active;
        await user.save();

        const updatedUser = await User.findById(userId).populate('additionalDetails').select('-password');

        return res.status(200).json({
            success: true,
            message: `User ${user.active ? 'activated' : 'deactivated'} successfully`,
            user: updatedUser
        });
    } catch (error) {
        console.error('Error toggling user status:', error);
        return res.status(500).json({
            success: false,
            message: 'Error toggling user status',
            error: error.message
        });
    }
};

// ================ GET ALL USERS ================
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .populate('additionalDetails')
            .select('-password')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            users,
            message: 'Users fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// ================ CREATE USER ================
exports.createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, accountType, contactNumber } = req.body;

        console.log('Create user request received:', {
            firstName,
            lastName,
            email,
            accountType,
            contactNumber: contactNumber ? 'provided' : 'not provided'
        });

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !accountType) {
            console.log('Validation failed - missing required fields');
            return res.status(400).json({ 
                success: false, 
                message: 'All required fields must be provided',
                missingFields: {
                    firstName: !firstName,
                    lastName: !lastName,
                    email: !email,
                    password: !password,
                    accountType: !accountType
                }
            });
        }

        // Validate account type
        if (!['Admin', 'Instructor', 'Student'].includes(accountType)) {
            console.log('Invalid account type:', accountType);
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid account type. Must be Admin, Instructor, or Student' 
            });
        }

        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists with email:', email);
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create profile
        console.log('Creating profile with contactNumber:', contactNumber);
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: contactNumber || null
        });

        console.log('Profile created successfully:', profileDetails._id);

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            approved: true,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        });

        console.log('User created successfully:', user._id);

        // Remove password from response
        user.password = undefined;

        return res.status(201).json({
            success: true,
            user,
            message: 'User created successfully'
        });
    } catch (error) {
        console.error('Error creating user:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        // Handle specific MongoDB validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: validationErrors
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
};

// ================ UPDATE USER ================
exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { firstName, lastName, email, accountType, contactNumber } = req.body;

        const user = await User.findById(userId).populate('additionalDetails');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (accountType) user.accountType = accountType;

        if (contactNumber && user.additionalDetails) {
            await Profile.findByIdAndUpdate(user.additionalDetails._id, { contactNumber }, { new: true });
        }

        await user.save();

        const updatedUser = await User.findById(userId).populate('additionalDetails').select('-password');

        return res.status(200).json({
            success: true,
            user: updatedUser,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
};

// ================ TOGGLE COURSE VISIBILITY ================
exports.toggleCourseVisibility = async (req, res) => {
    try {
        const { courseId } = req.params;

        console.log('Toggle course visibility request:', { courseId, body: req.body });

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, message: 'Invalid course ID' });
        }

        const course = await Course.findById(courseId)
            .populate('instructor', 'firstName lastName email')
            .populate('category', 'name');
            
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        course.isVisible = !course.isVisible;
        course.status = course.isVisible ? 'Published' : 'Draft';

        await course.save();

        const updatedCourse = await Course.findById(courseId)
            .populate('instructor', 'firstName lastName email')
            .populate('category', 'name');

        return res.status(200).json({
            success: true,
            message: `Course ${course.isVisible ? 'visible' : 'hidden'} successfully`,
            course: updatedCourse
        });
    } catch (error) {
        console.error('Error toggling course visibility:', error);
        return res.status(500).json({
            success: false,
            message: 'Error toggling course visibility',
            error: error.message
        });
    }
};

// ================ DELETE USER ================
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        console.log('Delete user request:', { userId, body: req.body, user: req.user?.id });

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }

        const user = await User.findById(userId).populate('additionalDetails');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
        }

        // Delete associated profile
        if (user.additionalDetails) {
            await Profile.findByIdAndDelete(user.additionalDetails._id);
        }

        // Delete the user
        await User.findByIdAndDelete(user._id);

        return res.status(200).json({ 
            success: true, 
            message: 'User deleted successfully' 
        });
    } catch (error) {
        console.error('Delete user failed:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error deleting user'
        });
    }
};

// ================ GET ALL COURSES ================
exports.getAllCourses = async (req, res) => {
    try {
        console.log('Fetching all courses with populated category...');
        const courses = await Course.find({})
            .populate('instructor', 'firstName lastName email')
            .populate('category', 'name _id')
            .sort({ createdAt: -1 });

        console.log('Courses fetched:', courses.length);
        console.log('Sample course category:', courses[0]?.category);

        return res.status(200).json({
            success: true,
            courses,
            message: 'Courses fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching courses',
            error: error.message
        });
    }
};

// ================ APPROVE COURSE ================
exports.approveCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findByIdAndUpdate(
            courseId,
            { status: 'Published' },
            { new: true }
        ).populate('instructor', 'firstName lastName email');

        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        return res.status(200).json({
            success: true,
            course,
            message: 'Course approved successfully'
        });
    } catch (error) {
        console.error('Error approving course:', error);
        return res.status(500).json({
            success: false,
            message: 'Error approving course',
            error: error.message
        });
    }
};

// ================ DELETE COURSE ================
exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        console.log('Delete course request:', { courseId, body: req.body });

        if (!courseId) {
            return res.status(400).json({ success: false, message: 'Course ID is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, message: 'Invalid course ID' });
        }

        const course = await Course.findById(courseId)
            .populate('instructor', 'firstName lastName email')
            .populate('courseContent');

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Unenroll students from the course
        const studentsEnrolled = course.studentsEnrolled || [];
        for (const studentId of studentsEnrolled) {
            await User.findByIdAndUpdate(studentId, {
                $pull: { courses: courseId },
            });
        }

        // Delete sections and sub-sections
        const courseSections = course.courseContent || [];
        for (const sectionId of courseSections) {
            // Delete sub-sections of the section
            const Section = require('../models/section');
            const SubSection = require('../models/subSection');
            
            const section = await Section.findById(sectionId);
            if (section) {
                const subSections = section.subSection || [];
                for (const subSectionId of subSections) {
                    await SubSection.findByIdAndDelete(subSectionId);
                }
            }

            // Delete the section
            await Section.findByIdAndDelete(sectionId);
        }

        // Remove course from instructor's courses list
        if (course.instructor) {
            await User.findByIdAndUpdate(course.instructor._id, {
                $pull: { courses: courseId }
            });
        }

        // Remove course from category
        if (course.category) {
            const Category = require('../models/category');
            await Category.findByIdAndUpdate(course.category, {
                $pull: { courses: courseId }
            });
        }

        // Delete the course
        await Course.findByIdAndDelete(courseId);

        return res.status(200).json({ 
            success: true, 
            message: 'Course deleted successfully' 
        });
    } catch (error) {
        console.error('Delete course failed:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error deleting course'
        });
    }
};

// ================ SET COURSE TYPE (ADMIN) ================
exports.setCourseType = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { courseType } = req.body; // 'Paid' or 'Free'

        if (!['Paid', 'Free'].includes(courseType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid course type. Use "Paid" or "Free"'
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Store original price if setting to free for the first time
        if (courseType === 'Free' && !course.originalPrice) {
            course.originalPrice = course.price;
        }

        // Update course type and admin settings
        course.courseType = courseType;
        course.adminSetFree = courseType === 'Free';

        // Set price based on course type
        if (courseType === 'Free') {
            course.price = 0;
        } else if (courseType === 'Paid' && course.originalPrice) {
            course.price = course.originalPrice;
        }

        await course.save();

        const updatedCourse = await Course.findById(courseId)
            .populate('instructor', 'firstName lastName email')
            .populate('category', 'name');

        return res.status(200).json({
            success: true,
            message: `Course set as ${courseType.toLowerCase()} successfully`,
            data: updatedCourse
        });

    } catch (error) {
        console.error('Error setting course type:', error);
        return res.status(500).json({
            success: false,
            message: 'Error setting course type',
            error: error.message
        });
    }
};

// ================ GET ANALYTICS DATA ================
exports.getAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const studentCount = await User.countDocuments({ accountType: 'Student' });
        const instructorCount = await User.countDocuments({ accountType: 'Instructor' });
        const adminCount = await User.countDocuments({ accountType: 'Admin' });

        const totalCourses = await Course.countDocuments();
        const publishedCourses = await Course.countDocuments({ status: 'Published' });
        const draftCourses = await Course.countDocuments({ status: 'Draft' });
        const freeCourses = await Course.countDocuments({ courseType: 'Free' });
        const paidCourses = await Course.countDocuments({ courseType: 'Paid' });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentRegistrations = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Get pending access requests count
        const CourseAccessRequest = require('../models/courseAccessRequest');
        const pendingRequests = await CourseAccessRequest.countDocuments({ status: 'Pending' });

        // Get recent courses (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentCourses = await Course.find({
            createdAt: { $gte: sevenDaysAgo }
        })
        .populate('instructor', 'firstName lastName')
        .select('courseName instructor createdAt status studentsEnrolled')
        .sort({ createdAt: -1 })
        .limit(10);

        // Format recent courses data
        const formattedRecentCourses = recentCourses.map(course => ({
            id: course._id,
            title: course.courseName,
            instructor: course.instructor ? `${course.instructor.firstName} ${course.instructor.lastName}` : 'Unknown',
            createdAt: course.createdAt,
            status: course.status,
            enrollments: course.studentsEnrolled ? course.studentsEnrolled.length : 0
        }));

        // Get recent logins (last 24 hours) - using user creation as proxy for login activity
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        const recentUsers = await User.find({
            createdAt: { $gte: twentyFourHoursAgo }
        })
        .select('firstName lastName email accountType createdAt')
        .sort({ createdAt: -1 })
        .limit(10);

        // Format recent logins data (using recent registrations as proxy)
        const formattedRecentLogins = recentUsers.map(user => ({
            id: user._id,
            user: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.accountType,
            loginTime: user.createdAt,
            location: 'Location not tracked' // Placeholder since we don't track location
        }));

        // activeLogins removed as per user request

        // Calculate revenue (mock data since we don't have payment tracking)
        const totalRevenue = paidCourses * 5000; // Assuming average course price
        const monthlyRevenue = Math.floor(totalRevenue * 0.15);
        const growthPercentage = 12.5;

        return res.status(200).json({
            success: true,
            analytics: {
                users: {
                    total: totalUsers,
                    students: studentCount,
                    instructors: instructorCount,
                    admins: adminCount,
                    recentRegistrations
                },
                courses: {
                    total: totalCourses,
                    published: publishedCourses,
                    draft: draftCourses,
                    free: freeCourses,
                    paid: paidCourses
                },
                requests: {
                    pendingAccessRequests: pendingRequests
                },
                revenue: {
                    totalRevenue,
                    monthlyRevenue,
                    growthPercentage,
                    yearlyRevenue: totalRevenue
                },
                recentCourses: formattedRecentCourses,
                recentLogins: formattedRecentLogins,
                // activeLogins removed as per user request
            },
            message: 'Analytics data fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching analytics',
            error: error.message
        });
    }
};

// ================ GET ALL INSTRUCTORS ================
exports.getAllInstructors = async (req, res) => {
    try {
        const instructors = await User.find({ accountType: 'Instructor' })
            .select('firstName lastName email _id')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Instructors fetched successfully',
            instructors
        });

    } catch (error) {
        console.error('Error fetching instructors:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ================ CREATE COURSE AS ADMIN ================
exports.createCourseAsAdmin = async (req, res) => {
    try {
        console.log('Create course request received:', {
            body: req.body,
            files: req.files ? Object.keys(req.files) : 'No files'
        });

        const {
            courseName,
            courseDescription,
            price,
            category,
            whatYouWillLearn,
            instructorId,
            status,
            tag,
            instructions
        } = req.body;

        // Get the thumbnail image from the request - fix variable mismatch
        const thumbnailFile = req.files?.thumbnailImage?.[0];

        console.log('Extracted data:', {
            courseName,
            courseDescription,
            price,
            category,
            whatYouWillLearn,
            instructorId,
            status,
            tag,
            instructions,
            thumbnailFile: thumbnailFile ? 'File present' : 'No file'
        });

        // Validation
        if (!courseName || !courseDescription || !price || !category || 
            !whatYouWillLearn || !instructorId || !status || !thumbnailFile) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided',
                missingFields: {
                    courseName: !courseName,
                    courseDescription: !courseDescription,
                    price: !price,
                    category: !category,
                    whatYouWillLearn: !whatYouWillLearn,
                    instructorId: !instructorId,
                    status: !status,
                    thumbnailFile: !thumbnailFile
                }
            });
        }

        // Verify instructor exists
        const instructor = await User.findById(instructorId);
        if (!instructor || instructor.accountType !== 'Instructor') {
            return res.status(400).json({
                success: false,
                message: 'Invalid instructor ID'
            });
        }

        // Verify category exists
        const Category = require('../models/category');
        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        // Upload thumbnail to Cloudinary
        const { uploadImageToCloudinary } = require('../utils/imageUploader');
        console.log('Uploading thumbnail to Cloudinary...');
        if (!process.env.FOLDER_NAME) {
            console.error('FOLDER_NAME environment variable is not set');
        }
        const thumbnailImage = await uploadImageToCloudinary(
            thumbnailFile,
            process.env.FOLDER_NAME || 'default_folder'
        );
        console.log('Thumbnail uploaded successfully:', thumbnailImage.secure_url);

        // Parse JSON fields
        let parsedTags = [];
        let parsedInstructions = [];

        try {
            parsedTags = tag ? JSON.parse(tag) : [];
            parsedInstructions = instructions ? JSON.parse(instructions) : [];
        } catch (parseError) {
            console.error('Error parsing JSON fields:', parseError);
            parsedTags = [];
            parsedInstructions = [];
        }

        console.log('Parsed data:', {
            parsedTags,
            parsedInstructions
        });

        // Create new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorId,
            whatYouWillLearn,
            price: Number(price),
            tag: parsedTags,
            category,
            thumbnail: thumbnailImage.secure_url,
            status,
            instructions: parsedInstructions,
            createdAt: new Date(),
        });

        console.log('Course created successfully:', newCourse._id);

        // Add course to instructor's courses
        await User.findByIdAndUpdate(
            instructorId,
            { $push: { courses: newCourse._id } },
            { new: true }
        );

        // Add course to category
        await Category.findByIdAndUpdate(
            category,
            { $push: { courses: newCourse._id } },
            { new: true }
        );

        // Populate the course with instructor and category details
        const populatedCourse = await Course.findById(newCourse._id)
            .populate('instructor', 'firstName lastName email')
            .populate('category', 'name description');

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            course: populatedCourse
        });

    } catch (error) {
        console.error('Error creating course:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            fullError: error
        });
        
        // Handle specific errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: validationErrors
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
