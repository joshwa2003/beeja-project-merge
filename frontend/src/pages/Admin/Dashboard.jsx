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
        <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-[80px]' : 'ml-[280px]'} mt-[3.5rem]`}>
          <div className="p-6">
            {/* Header */}
            <motion.div 
              className="mb-8 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {showCreateCourse ? 'Create Course' : sidebarItems.find(item => item.id === activeTab)?.label}
              </h1>
              <p className="text-slate-400 mt-2">
                Manage your platform efficiently with these tools
              </p>
            </motion.div>

            {/* Content */}
            <motion.div 
              className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
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
