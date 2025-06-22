require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('./models/notification');
const UserNotificationStatus = require('./models/userNotificationStatus');

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

const testActualDelete = async () => {
    try {
        await connectDB();

        // Get the first notification
        const notification = await Notification.findOne({
            $or: [
                { 'metadata.sentByAdmin': true },
                { type: 'ADMIN_ANNOUNCEMENT' }
            ]
        });

        if (!notification) {
            console.log('No notifications found to test deletion.');
            process.exit(0);
        }

        console.log('Found notification to delete:');
        console.log('ID:', notification._id);
        console.log('Title:', notification.title);
        console.log('BulkId:', notification.bulkId || 'None');

        const notificationId = notification._id.toString();

        // Count related user statuses before deletion
        const userStatusCountBefore = await UserNotificationStatus.countDocuments({
            notification: notification._id
        });
        console.log(`Found ${userStatusCountBefore} related user notification statuses`);

        // Perform actual deletion
        console.log('\n=== PERFORMING ACTUAL DELETION ===');

        // Delete user notification statuses first
        const statusDeleteResult = await UserNotificationStatus.deleteMany({
            notification: notification._id
        });
        console.log(`Deleted ${statusDeleteResult.deletedCount} user notification statuses`);

        // Delete the notification
        const deleteResult = await Notification.deleteOne({ _id: notification._id });
        console.log(`Deleted ${deleteResult.deletedCount} notifications`);

        // Verify deletion
        const deletedNotification = await Notification.findById(notification._id);
        if (deletedNotification) {
            console.log('ERROR: Notification still exists after deletion!');
        } else {
            console.log('SUCCESS: Notification was deleted successfully!');
        }

        // Check remaining user statuses
        const userStatusCountAfter = await UserNotificationStatus.countDocuments({
            notification: notification._id
        });
        console.log(`Remaining user notification statuses: ${userStatusCountAfter}`);

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
};

testActualDelete();
