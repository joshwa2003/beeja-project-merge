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

const testDeleteNotification = async () => {
    try {
        await connectDB();

        // First, let's see what notifications exist
        console.log('\n=== EXISTING NOTIFICATIONS ===');
        const allNotifications = await Notification.find({
            $or: [
                { 'metadata.sentByAdmin': true },
                { type: 'ADMIN_ANNOUNCEMENT' }
            ]
        }).sort({ createdAt: -1 }).limit(5);

        console.log(`Found ${allNotifications.length} admin notifications:`);
        allNotifications.forEach((notification, index) => {
            console.log(`${index + 1}. ID: ${notification._id}`);
            console.log(`   Title: ${notification.title}`);
            console.log(`   BulkId: ${notification.bulkId || 'None'}`);
            console.log(`   Type: ${notification.type}`);
            console.log(`   Created: ${notification.createdAt}`);
            console.log('');
        });

        if (allNotifications.length === 0) {
            console.log('No admin notifications found to test deletion.');
            process.exit(0);
        }

        // Test the delete logic with the first notification
        const testNotification = allNotifications[0];
        const notificationId = testNotification._id.toString();

        console.log(`\n=== TESTING DELETE FOR NOTIFICATION: ${notificationId} ===`);
        console.log(`Title: ${testNotification.title}`);
        console.log(`BulkId: ${testNotification.bulkId || 'None'}`);

        // Simulate the delete logic from the controller
        let deleteQuery = { 
            $or: [
                { bulkId: notificationId },
                { 'metadata.bulkId': notificationId }
            ]
        };
        
        let notificationsToDelete = await Notification.find(deleteQuery);
        
        // If no bulk notifications found, try to find individual notification
        if (notificationsToDelete.length === 0) {
            console.log('No bulk notifications found, searching for individual notification...');
            const notification = await Notification.findById(notificationId);
            
            if (!notification) {
                console.log('Notification not found in database');
                process.exit(1);
            }

            console.log('Found individual notification:', {
                id: notification._id,
                title: notification.title,
                bulkId: notification.bulkId
            });

            // If this notification has a bulkId, delete all notifications with the same bulkId
            if (notification.bulkId || notification.metadata?.bulkId) {
                const bulkIdToDelete = notification.bulkId || notification.metadata.bulkId;
                deleteQuery = { 
                    $or: [
                        { bulkId: bulkIdToDelete },
                        { 'metadata.bulkId': bulkIdToDelete }
                    ]
                };
                console.log('Will delete all notifications with bulkId:', bulkIdToDelete);
            } else {
                // Delete just this individual notification
                deleteQuery = { _id: notificationId };
                console.log('Will delete individual notification with ID:', notificationId);
            }
        } else {
            console.log(`Found ${notificationsToDelete.length} notifications with bulkId:`, notificationId);
        }

        console.log('Final delete query:', JSON.stringify(deleteQuery, null, 2));

        // Get all notification IDs that will be deleted
        const notificationsToDeleteIds = await Notification.find(deleteQuery).distinct('_id');
        console.log('Notification IDs to delete:', notificationsToDeleteIds);

        // Count related UserNotificationStatus entries
        const userStatusCount = await UserNotificationStatus.countDocuments({
            notification: { $in: notificationsToDeleteIds }
        });
        console.log(`Found ${userStatusCount} related user notification statuses`);

        // Perform the actual deletion (commented out for safety)
        console.log('\n=== SIMULATING DELETION (NOT ACTUALLY DELETING) ===');
        console.log(`Would delete ${notificationsToDeleteIds.length} notifications`);
        console.log(`Would delete ${userStatusCount} user notification statuses`);

        // Uncomment the lines below to actually perform the deletion
        /*
        if (notificationsToDeleteIds.length > 0) {
            const statusDeleteResult = await UserNotificationStatus.deleteMany({
                notification: { $in: notificationsToDeleteIds }
            });
            console.log(`Deleted ${statusDeleteResult.deletedCount} user notification statuses`);
        }

        const deleteResult = await Notification.deleteMany(deleteQuery);
        console.log(`Deleted ${deleteResult.deletedCount} notifications`);
        */

        console.log('\nTest completed successfully!');

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
};

testDeleteNotification();
