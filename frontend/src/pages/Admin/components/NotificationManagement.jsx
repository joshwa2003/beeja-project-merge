import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiSend, FiUsers, FiUser, FiTrash2, FiEdit3 } from 'react-icons/fi';
import { BsCheckAll } from 'react-icons/bs';
import { IoClose } from 'react-icons/io5';
import { sendNotification, getAllNotifications, deleteNotificationAdmin } from '../../../services/operations/adminNotificationAPI';
import { getAllUsers } from '../../../services/operations/adminAPI';
import toast from 'react-hot-toast';

const NotificationManagement = () => {
  const { token } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    recipients: 'all', // 'all', 'specific', 'students', 'instructors'
    selectedUsers: [],
    relatedCourse: ''
  });

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getAllNotifications(token);
      if (response.success) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers(token);
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserSelection = (userId) => {
    setFormData(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter(id => id !== userId)
        : [...prev.selectedUsers, userId]
    }));
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.recipients === 'specific' && formData.selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    try {
      setLoading(true);
      const notificationData = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        recipients: formData.recipients,
        selectedUsers: formData.recipients === 'specific' ? formData.selectedUsers : undefined,
        relatedCourse: formData.relatedCourse || undefined
      };

      const response = await sendNotification(notificationData, token);
      
      if (response.success) {
        toast.success('Notification sent successfully!');
        setFormData({
          title: '',
          message: '',
          recipients: 'all',
          selectedUsers: [],
          relatedCourse: ''
        });
        setShowCreateForm(false);
        fetchNotifications();
      } else {
        toast.error(response.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      const response = await deleteNotificationAdmin(notificationId, token);
      if (response.success) {
        toast.success('Notification deleted successfully');
        fetchNotifications();
      } else {
        toast.error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getRecipientText = (notification) => {
    if (notification.recipients === 'all') return 'All Users';
    if (notification.recipients === 'students') return 'All Students';
    if (notification.recipients === 'instructors') return 'All Instructors';
    if (notification.recipients === 'specific') {
      return `${notification.recipientCount || 0} Selected Users`;
    }
    return 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Notification Management</h2>
          <p className="text-gray-400">Send custom notifications to users</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
        >
          <FiSend className="w-4 h-4" />
          Send Notification
        </motion.button>
      </div>

      {/* Create Notification Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Send New Notification</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <IoClose className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendNotification} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter notification title"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Enter notification message"
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                {/* Recipients */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Recipients
                  </label>
                  <select
                    name="recipients"
                    value={formData.recipients}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All Users</option>
                    <option value="students">All Students</option>
                    <option value="instructors">All Instructors</option>
                    <option value="specific">Specific Users</option>
                  </select>
                </div>

                {/* User Selection */}
                {formData.recipients === 'specific' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Users ({formData.selectedUsers.length} selected)
                    </label>
                    <div className="max-h-48 overflow-y-auto bg-slate-700 rounded-xl border border-slate-600">
                      {users.map((user) => (
                        <label
                          key={user._id}
                          className="flex items-center p-3 hover:bg-slate-600 cursor-pointer border-b border-slate-600 last:border-b-0"
                        >
                          <input
                            type="checkbox"
                            checked={formData.selectedUsers.includes(user._id)}
                            onChange={() => handleUserSelection(user._id)}
                            className="mr-3 w-4 h-4 text-indigo-600 bg-slate-600 border-slate-500 rounded focus:ring-indigo-500"
                          />
                          <div className="flex items-center gap-3">
                            <img
                              src={user.image || `https://api.dicebear.com/5.x/initials/svg?seed=${user.firstName} ${user.lastName}`}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="text-white text-sm font-medium">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-gray-400 text-xs">{user.email}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-6 py-3 bg-slate-600 text-white rounded-xl font-semibold hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <FiSend className="w-4 h-4" />
                        Send Notification
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications List */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-white">Recent Notifications</h3>
          <p className="text-gray-400 text-sm mt-1">Manage sent notifications</p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <FiBell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No notifications sent yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {notifications.map((notification) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-slate-700/30 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-2">{notification.title}</h4>
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">{notification.message}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiUsers className="w-3 h-3" />
                        {getRecipientText(notification)}
                      </span>
                      <span>
                        {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                        {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {notification.readCount !== undefined && (
                        <span className="flex items-center gap-1">
                          <BsCheckAll className="w-3 h-3" />
                          {notification.readCount} read
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteNotification(notification._id)}
                    className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all duration-200"
                    title="Delete notification"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationManagement;
