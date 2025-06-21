const Notification = require('../models/notification');
const User = require('../models/user');
const Course = require('../models/course');

// Create a new notification (internal use)
exports.createNotification = async (recipientId, type, title, message, relatedCourse = null) => {
    try {
        const notification = await Notification.create({
            recipient: recipientId,
            type,
            title,
            message,
            relatedCourse
        });
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Enhanced create notification with all fields
exports.createAdvancedNotification = async (notificationData) => {
    try {
        const notification = new Notification(notificationData);
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating advanced notification:', error);
        throw error;
    }
};

// Get user's notifications
exports.getUserNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user.id;

        const notifications = await Notification.find({ recipient: userId })
            .populate('relatedCourse', 'courseName thumbnail')
            .populate('relatedUser', 'firstName lastName email')
            .populate('relatedSection', 'sectionName')
            .populate('relatedSubSection', 'title')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const totalNotifications = await Notification.countDocuments({ recipient: userId });
        const unreadCount = await Notification.countDocuments({ 
            recipient: userId, 
            read: false 
        });

        return res.status(200).json({
            success: true,
            data: {
                notifications,
                totalNotifications,
                unreadCount,
                currentPage: page,
                totalPages: Math.ceil(totalNotifications / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message
        });
    }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.body;
        const userId = req.user.id;

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        return res.status(200).json({
            success: true,
            notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return res.status(500).json({
            success: false,
            message: 'Error marking notification as read',
            error: error.message
        });
    }
};

// Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await Notification.updateMany(
            { recipient: userId, read: false },
            { read: true }
        );

        return res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return res.status(500).json({
            success: false,
            message: 'Error marking all notifications as read',
            error: error.message
        });
    }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.body;
        const userId = req.user.id;

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            recipient: userId
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting notification',
            error: error.message
        });
    }
};

// Helper functions for specific notification types

// Student Notifications
exports.createCourseEnrollmentConfirmation = async (studentId, courseId) => {
    try {
        const course = await Course.findById(courseId).select('courseName');
        if (!course) return;

        return await exports.createAdvancedNotification({
            recipient: studentId,
            type: 'COURSE_ENROLLMENT_CONFIRMATION',
            title: 'Course Enrollment Confirmed',
            message: `You have successfully enrolled in "${course.courseName}". Start learning now!`,
            relatedCourse: courseId,
            priority: 'high',
            actionUrl: `/view-course/${courseId}`,
            metadata: { enrollmentDate: new Date() }
        });
    } catch (error) {
        console.error('Error creating enrollment confirmation:', error);
    }
};

exports.createNewContentNotification = async (courseId, sectionId, subSectionId) => {
    try {
        const course = await Course.findById(courseId)
            .populate('studentsEnrolled', '_id')
            .populate({
                path: 'courseContent',
                populate: {
                    path: 'subSection',
                    select: 'title'
                }
            });

        if (!course) return;

        const section = course.courseContent.find(s => s._id.toString() === sectionId);
        const subSection = section?.subSection?.find(ss => ss._id.toString() === subSectionId);

        if (!subSection) return;

        // Notify all enrolled students
        const notifications = course.studentsEnrolled.map(student => ({
            recipient: student._id,
            type: 'NEW_CONTENT_ADDED',
            title: 'New Content Available',
            message: `New content "${subSection.title}" has been added to "${course.courseName}"`,
            relatedCourse: courseId,
            relatedSection: sectionId,
            relatedSubSection: subSectionId,
            priority: 'medium',
            actionUrl: `/view-course/${courseId}`,
            metadata: { contentType: 'subsection' }
        }));

        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error creating new content notifications:', error);
    }
};

exports.createProgressMilestoneNotification = async (studentId, courseId, milestone) => {
    try {
        const course = await Course.findById(courseId).select('courseName');
        if (!course) return;

        return await exports.createAdvancedNotification({
            recipient: studentId,
            type: 'COURSE_PROGRESS_MILESTONE',
            title: 'Progress Milestone Reached!',
            message: `Congratulations! You've completed ${milestone}% of "${course.courseName}"`,
            relatedCourse: courseId,
            priority: 'medium',
            actionUrl: `/view-course/${courseId}`,
            metadata: { milestone, achievedAt: new Date() }
        });
    } catch (error) {
        console.error('Error creating progress milestone notification:', error);
    }
};

// Instructor Notifications
exports.createNewStudentEnrollmentNotification = async (instructorId, studentId, courseId) => {
    try {
        const [course, student] = await Promise.all([
            Course.findById(courseId).select('courseName'),
            User.findById(studentId).select('firstName lastName')
        ]);

        if (!course || !student) return;

        return await exports.createAdvancedNotification({
            recipient: instructorId,
            type: 'NEW_STUDENT_ENROLLMENT',
            title: 'New Student Enrollment',
            message: `${student.firstName} ${student.lastName} has enrolled in your course "${course.courseName}"`,
            relatedCourse: courseId,
            relatedUser: studentId,
            priority: 'medium',
            actionUrl: `/instructor/courses/${courseId}/students`,
            metadata: { enrollmentDate: new Date() }
        });
    } catch (error) {
        console.error('Error creating student enrollment notification:', error);
    }
};

exports.createNewRatingNotification = async (instructorId, courseId, rating, review) => {
    try {
        const course = await Course.findById(courseId).select('courseName');
        if (!course) return;

        return await exports.createAdvancedNotification({
            recipient: instructorId,
            type: 'NEW_RATING_ON_COURSE',
            title: 'New Course Rating',
            message: `Your course "${course.courseName}" received a ${rating}-star rating${review ? ' with a review' : ''}`,
            relatedCourse: courseId,
            priority: 'medium',
            actionUrl: `/instructor/courses/${courseId}/reviews`,
            metadata: { rating, hasReview: !!review }
        });
    } catch (error) {
        console.error('Error creating rating notification:', error);
    }
};

exports.createCourseStatusChangeNotification = async (instructorId, courseId, oldStatus, newStatus) => {
    try {
        const course = await Course.findById(courseId).select('courseName');
        if (!course) return;

        return await exports.createAdvancedNotification({
            recipient: instructorId,
            type: 'COURSE_STATUS_CHANGE',
            title: 'Course Status Updated',
            message: `Your course "${course.courseName}" status changed from ${oldStatus} to ${newStatus}`,
            relatedCourse: courseId,
            priority: newStatus === 'Published' ? 'high' : 'medium',
            actionUrl: `/instructor/courses/${courseId}`,
            metadata: { oldStatus, newStatus, changedAt: new Date() }
        });
    } catch (error) {
        console.error('Error creating course status change notification:', error);
    }
};

// Admin Notifications
exports.createNewCourseCreationNotification = async (courseId, instructorId) => {
    try {
        const [course, instructor, admins] = await Promise.all([
            Course.findById(courseId).select('courseName'),
            User.findById(instructorId).select('firstName lastName'),
            User.find({ accountType: 'Admin' }).select('_id')
        ]);

        if (!course || !instructor || !admins.length) return;

        const notifications = admins.map(admin => ({
            recipient: admin._id,
            type: 'NEW_COURSE_CREATION',
            title: 'New Course Created',
            message: `${instructor.firstName} ${instructor.lastName} created a new course "${course.courseName}"`,
            relatedCourse: courseId,
            relatedUser: instructorId,
            priority: 'medium',
            actionUrl: `/admin/courses/${courseId}`,
            metadata: { createdAt: new Date() }
        }));

        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error creating course creation notifications:', error);
    }
};

exports.createNewUserRegistrationNotification = async (newUserId) => {
    try {
        const [newUser, admins] = await Promise.all([
            User.findById(newUserId).select('firstName lastName email accountType'),
            User.find({ accountType: 'Admin' }).select('_id')
        ]);

        if (!newUser || !admins.length) return;

        const notifications = admins.map(admin => ({
            recipient: admin._id,
            type: 'NEW_USER_REGISTRATION',
            title: 'New User Registration',
            message: `${newUser.firstName} ${newUser.lastName} (${newUser.accountType}) has registered`,
            relatedUser: newUserId,
            priority: 'low',
            actionUrl: `/admin/users/${newUserId}`,
            metadata: { userType: newUser.accountType, registeredAt: new Date() }
        }));

        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error creating user registration notifications:', error);
    }
};

exports.createCourseModificationNotification = async (courseId, instructorId, modificationType) => {
    try {
        const [course, instructor, admins] = await Promise.all([
            Course.findById(courseId).select('courseName'),
            User.findById(instructorId).select('firstName lastName'),
            User.find({ accountType: 'Admin' }).select('_id')
        ]);

        if (!course || !instructor || !admins.length) return;

        const notifications = admins.map(admin => ({
            recipient: admin._id,
            type: 'COURSE_MODIFICATION',
            title: 'Course Modified',
            message: `${instructor.firstName} ${instructor.lastName} made ${modificationType} changes to "${course.courseName}"`,
            relatedCourse: courseId,
            relatedUser: instructorId,
            priority: 'low',
            actionUrl: `/admin/courses/${courseId}`,
            metadata: { modificationType, modifiedAt: new Date() }
        }));

        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error creating course modification notifications:', error);
    }
};

// Bulk notification helpers
exports.notifyEnrolledStudents = async (courseId, notificationData) => {
    try {
        const course = await Course.findById(courseId).populate('studentsEnrolled', '_id');
        if (!course) return;

        const notifications = course.studentsEnrolled.map(student => ({
            ...notificationData,
            recipient: student._id,
            relatedCourse: courseId
        }));

        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error notifying enrolled students:', error);
    }
};

exports.notifyAllAdmins = async (notificationData) => {
    try {
        const admins = await User.find({ accountType: 'Admin' }).select('_id');
        const notifications = admins.map(admin => ({
            ...notificationData,
            recipient: admin._id
        }));

        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error notifying all admins:', error);
    }
};

exports.notifyAllInstructors = async (notificationData) => {
    try {
        const instructors = await User.find({ accountType: 'Instructor' }).select('_id');
        const notifications = instructors.map(instructor => ({
            ...notificationData,
            recipient: instructor._id
        }));

        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error notifying all instructors:', error);
    }
};

// Instructor Approval Notification
exports.createInstructorApprovalNotification = async (instructorId) => {
    try {
        const instructor = await User.findById(instructorId).select('firstName lastName email');
        
        if (!instructor) return;

        const notification = new Notification({
            recipient: instructorId,
            type: 'INSTRUCTOR_APPROVAL',
            title: 'Account Approved!',
            message: `Congratulations! Your instructor account has been approved. You can now create and manage courses.`,
            priority: 'high',
            actionUrl: '/dashboard/instructor',
            metadata: { approvedAt: new Date() }
        });

        await notification.save();
    } catch (error) {
        console.error('Error creating instructor approval notification:', error);
    }
};

// New Course Announcement to All Users
exports.createNewCourseAnnouncementToAll = async (courseId, instructorId) => {
    try {
        const [course, instructor, allUsers] = await Promise.all([
            Course.findById(courseId).select('courseName courseDescription thumbnail'),
            User.findById(instructorId).select('firstName lastName'),
            User.find({ 
                accountType: { $in: ['Student', 'Instructor'] },
                active: true 
            }).select('_id accountType')
        ]);

        if (!course || !instructor || !allUsers.length) return;

        const notifications = allUsers.map(user => ({
            recipient: user._id,
            type: 'NEW_COURSE_CREATION',
            title: 'New Course Available!',
            message: `${instructor.firstName} ${instructor.lastName} has created a new course "${course.courseName}". Check it out now!`,
            relatedCourse: courseId,
            relatedUser: instructorId,
            priority: 'medium',
            actionUrl: `/courses/${courseId}`,
            metadata: { 
                createdAt: new Date(),
                userType: user.accountType,
                announcementType: 'new_course_launch'
            }
        }));

        await Notification.insertMany(notifications);
        console.log(`Created ${notifications.length} new course announcement notifications`);
    } catch (error) {
        console.error('Error creating new course announcement notifications:', error);
    }
};

// Notify all students about new course
exports.notifyAllStudents = async (notificationData) => {
    try {
        const students = await User.find({ 
            accountType: 'Student',
            active: true 
        }).select('_id');
        
        const notifications = students.map(student => ({
            ...notificationData,
            recipient: student._id
        }));

        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error notifying all students:', error);
    }
};
