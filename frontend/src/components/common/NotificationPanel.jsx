import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { IoNotificationsOutline } from 'react-icons/io5';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/operations/notificationAPI';

export default function NotificationPanel() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        if (token) {
            fetchNotifications();
        }
    }, [token]);

    const fetchNotifications = async () => {
        try {
            const response = await getNotifications();
            if (response.success) {
                setNotifications(response.notifications);
                setUnreadCount(response.notifications.filter(n => !n.read).length);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            const response = await markNotificationAsRead(notificationId);
            if (response.success) {
                setNotifications(notifications.map(notification => 
                    notification._id === notificationId 
                        ? { ...notification, read: true }
                        : notification
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const response = await markAllNotificationsAsRead();
            if (response.success) {
                setNotifications(notifications.map(notification => ({ ...notification, read: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    return (
        <div className="relative">
            {/* Notification Bell Icon */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <IoNotificationsOutline className="w-6 h-6" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    >
                        {unreadCount}
                    </motion.span>
                )}
            </motion.button>

            {/* Notification Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-80 max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-xl z-50"
                    >
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="divide-y divide-gray-200">
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <motion.div
                                        key={notification._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                            !notification.read ? 'bg-blue-50' : ''
                                        }`}
                                        onClick={() => handleMarkAsRead(notification._id)}
                                    >
                                        <div className="flex items-start">
                                            {notification.relatedCourse?.thumbnail && (
                                                <img
                                                    src={notification.relatedCourse.thumbnail}
                                                    alt="Course thumbnail"
                                                    className="w-10 h-10 rounded object-cover mr-3"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-gray-900">
                                                    {notification.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(notification.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-500">
                                    No notifications
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
