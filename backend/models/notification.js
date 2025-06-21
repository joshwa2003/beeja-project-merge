const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            // Student notifications
            'COURSE_ENROLLMENT_CONFIRMATION',
            'NEW_CONTENT_ADDED',
            'COURSE_PROGRESS_MILESTONE',
            'NEW_RATING_ON_ENROLLED_COURSE',
            
            // Instructor notifications
            'NEW_STUDENT_ENROLLMENT',
            'NEW_RATING_ON_COURSE',
            'COURSE_STATUS_CHANGE',
            'COURSE_CONTENT_UPDATE',
            'INSTRUCTOR_APPROVAL',
            
            // Admin notifications
            'NEW_COURSE_CREATION',
            'COURSE_MODIFICATION',
            'NEW_USER_REGISTRATION',
            'NEW_RATING_REVIEW',
            'ADMIN_ANNOUNCEMENT',
            
            // Legacy types (for backward compatibility)
            'COURSE_ENROLLMENT',
            'CONTENT_UPDATE',
            'PROGRESS_UPDATE',
            'REVIEW',
            'COURSE_STATUS',
            
            // General notifications
            'GENERAL',
            'SYSTEM_UPDATE'
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    relatedCourse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    relatedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    relatedSection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'
    },
    relatedSubSection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubSection'
    },
    relatedRating: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RatingAndReview'
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    actionUrl: {
        type: String // URL to redirect when notification is clicked
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed // Additional data specific to notification type
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ relatedCourse: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
