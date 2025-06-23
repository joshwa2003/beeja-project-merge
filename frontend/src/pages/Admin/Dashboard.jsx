import { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

import AdminSidebar from '../../components/core/Dashboard/Admin/AdminSidebar';
import UserManagement from './components/UserManagement';
import CourseManagement from './components/CourseManagement';
import CreateCourse from './components/CreateCourse/CreateCourse';
import EnhancedAnalytics from './components/EnhancedAnalytics';
import Settings from './components/Settings';
import CourseTypeManager from '../../components/core/Dashboard/Admin/CourseTypeManager';
import CourseAccessRequests from '../../components/core/Dashboard/Admin/CourseAccessRequests';
import QuizManagement from './components/QuizManagement';
import NotificationManagement from './components/NotificationManagement';
import FeaturedCoursesManagement from './components/FeaturedCoursesManagement';
import ContactMessages from '../../components/core/Dashboard/Admin/ContactMessages';
import FaqManagement from './components/FaqManagement';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.profile);
  const { isCollapsed } = useSelector((state) => state.sidebar);
  const [activeTab, setActiveTab] = useState('analytics');
  const [showCreateCourse, setShowCreateCourse] = useState(false);

  // Sidebar navigation items for title display
  const sidebarItems = [
    { id: 'users', label: 'User Management' },
    { id: 'courses', label: 'Course Management' },
    { id: 'courseTypes', label: 'Course Types' },
    { id: 'quizzes', label: 'Quiz Management' },
    { id: 'accessRequests', label: 'Access Requests' },
    { id: 'notifications', label: 'Notification Management' },
    { id: 'contactMessages', label: 'Contact Messages' },
    { id: 'featuredCourses', label: 'Featured Courses Management' },
    { id: 'faqs', label: 'FAQ Management' },
    { id: 'analytics', label: 'Analytics Dashboard' },
    { id: 'settings', label: 'Settings' },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setShowCreateCourse(false);
  };

  const handleCreateCourse = () => {
    setShowCreateCourse(true);
    setActiveTab('courses');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex">
        {/* Modern Sidebar */}
        <div className="sm:fixed sm:left-0 sm:top-16 h-[calc(100vh-4rem)] z-30 transition-all duration-300">
          <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        {/* Main Content */}
        <div className={`flex-1 mt-16 min-h-[calc(100vh-4rem)] transition-all duration-300 ${
          isCollapsed ? 'sm:ml-16' : 'sm:ml-64'
        } w-full px-4 sm:px-0`}>
          <div className="p-4 sm:p-6 overflow-x-hidden">
            {/* Header */}
            <motion.div 
              className="mb-4 sm:mb-8 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {showCreateCourse ? 'Create Course' : sidebarItems.find(item => item.id === activeTab)?.label}
              </h1>
              <p className="text-slate-400 mt-2">
                Manage your platform efficiently with these tools
              </p>
            </motion.div>

            {/* Content */}
            <motion.div 
              className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {showCreateCourse ? (
                <CreateCourse onCancel={() => setShowCreateCourse(false)} />
              ) : (
                <>
                  {activeTab === 'users' && <UserManagement />}
                  {activeTab === 'courses' && <CourseManagement onCreateCourse={handleCreateCourse} />}
                  {activeTab === 'courseTypes' && <CourseTypeManager />}
                  {activeTab === 'accessRequests' && <CourseAccessRequests />}
                  {activeTab === 'analytics' && <EnhancedAnalytics />}
                  {activeTab === 'settings' && <Settings />}
                  {activeTab === 'quizzes' && <QuizManagement />}
                  {activeTab === 'notifications' && <NotificationManagement />}
                  {activeTab === 'contactMessages' && <ContactMessages />}
                  {activeTab === 'featuredCourses' && <FeaturedCoursesManagement />}
                  {activeTab === 'faqs' && <FaqManagement />}
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
