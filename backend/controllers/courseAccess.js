const CourseAccessRequest = require('../models/courseAccessRequest');
const Course = require('../models/course');
const User = require('../models/user');

// ================ REQUEST COURSE ACCESS ================
exports.requestCourseAccess = async (req, res) => {
    try {
        const { courseId, requestMessage } = req.body;
        const userId = req.user.id;

        // Check if course exists and is free
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (course.courseType !== 'Free') {
            return res.status(400).json({
                success: false,
                message: 'This course is not available for free access'
            });
        }

        // Check if user is already enrolled
        if (course.studentsEnrolled.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: 'You are already enrolled in this course'
            });
        }

        // Check if user already has a pending request
        const existingRequest = await CourseAccessRequest.findOne({
            user: userId,
            course: courseId,
            status: 'Pending'
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'You already have a pending request for this course'
            });
        }

        // Create new access request
        const accessRequest = await CourseAccessRequest.create({
            user: userId,
            course: courseId,
            requestMessage: requestMessage || '',
            status: 'Pending'
        });

        const populatedRequest = await CourseAccessRequest.findById(accessRequest._id)
            .populate('user', 'firstName lastName email')
            .populate('course', 'courseName thumbnail');

        return res.status(201).json({
            success: true,
            message: 'Course access request submitted successfully',
            data: populatedRequest
        });

    } catch (error) {
        console.error('Error requesting course access:', error);
        return res.status(500).json({
            success: false,
            message: 'Error submitting course access request',
            error: error.message
        });
    }
};

// ================ GET USER'S ACCESS REQUESTS ================
exports.getUserAccessRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await CourseAccessRequest.find({ user: userId })
            .populate('course', 'courseName thumbnail instructor')
            .populate('approvedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: requests,
            message: 'Access requests fetched successfully'
        });

    } catch (error) {
        console.error('Error fetching user access requests:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching access requests',
            error: error.message
        });
    }
};

// ================ GET ALL ACCESS REQUESTS (ADMIN) ================
exports.getAllAccessRequests = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        
        const filter = {};
        if (status && ['Pending', 'Approved', 'Rejected'].includes(status)) {
            filter.status = status;
        }

        const skip = (page - 1) * limit;

        const requests = await CourseAccessRequest.find(filter)
            .populate('user', 'firstName lastName email image')
            .populate('course', 'courseName thumbnail instructor')
            .populate('course.instructor', 'firstName lastName')
            .populate('approvedBy', 'firstName lastName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalRequests = await CourseAccessRequest.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data: requests,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalRequests / limit),
                totalRequests,
                hasNext: page * limit < totalRequests,
                hasPrev: page > 1
            },
            message: 'Access requests fetched successfully'
        });

    } catch (error) {
        console.error('Error fetching access requests:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching access requests',
            error: error.message
        });
    }
};

// ================ APPROVE/REJECT ACCESS REQUEST (ADMIN) ================
exports.handleAccessRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { action, adminResponse } = req.body; // action: 'approve' or 'reject'
        const adminId = req.user.id;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Use "approve" or "reject"'
            });
        }

        const accessRequest = await CourseAccessRequest.findById(requestId)
            .populate('user', 'firstName lastName email')
            .populate('course', 'courseName studentsEnrolled');

        if (!accessRequest) {
            return res.status(404).json({
                success: false,
                message: 'Access request not found'
            });
        }

        if (accessRequest.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'This request has already been processed'
            });
        }

        // Update request status
        accessRequest.status = action === 'approve' ? 'Approved' : 'Rejected';
        accessRequest.adminResponse = adminResponse || '';
        accessRequest.approvedBy = adminId;
        accessRequest.responseDate = new Date();

        await accessRequest.save();

        // If approved, enroll user in the course
        if (action === 'approve') {
            const course = await Course.findById(accessRequest.course._id);
            if (!course.studentsEnrolled.includes(accessRequest.user._id)) {
                course.studentsEnrolled.push(accessRequest.user._id);
                await course.save();
            }

            // Add course to user's enrolled courses
            const user = await User.findById(accessRequest.user._id);
            if (!user.courses.includes(accessRequest.course._id)) {
                user.courses.push(accessRequest.course._id);
                await user.save();
            }
        }

        const updatedRequest = await CourseAccessRequest.findById(requestId)
            .populate('user', 'firstName lastName email')
            .populate('course', 'courseName thumbnail')
            .populate('approvedBy', 'firstName lastName');

        return res.status(200).json({
            success: true,
            message: `Access request ${action}d successfully`,
            data: updatedRequest
        });

    } catch (error) {
        console.error('Error handling access request:', error);
        return res.status(500).json({
            success: false,
            message: 'Error processing access request',
            error: error.message
        });
    }
};

// ================ GET FREE COURSES ================
exports.getFreeCourses = async (req, res) => {
    try {
        const { page = 1, limit = 10, category } = req.query;
        const skip = (page - 1) * limit;

        const filter = {
            courseType: 'Free',
            status: 'Published',
            isVisible: true
        };

        if (category) {
            filter.category = category;
        }

        const courses = await Course.find(filter)
            .populate('instructor', 'firstName lastName')
            .populate('category', 'name')
            .select('courseName courseDescription thumbnail price originalPrice courseType tag createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalCourses = await Course.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data: courses,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCourses / limit),
                totalCourses,
                hasNext: page * limit < totalCourses,
                hasPrev: page > 1
            },
            message: 'Free courses fetched successfully'
        });

    } catch (error) {
        console.error('Error fetching free courses:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching free courses',
            error: error.message
        });
    }
};
