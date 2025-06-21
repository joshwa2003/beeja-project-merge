const Notification = require('../models/notification');
const User = require('../models/user');

// Create a new notification
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

// Get user's notifications
exports.getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .populate('relatedCourse', 'courseName thumbnail');

        return res.status(200).json({
            success: true,
            notifications
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
