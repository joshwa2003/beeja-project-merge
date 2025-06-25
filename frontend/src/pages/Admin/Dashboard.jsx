import { useState } from 'react';
import { useSelector } from 'react-redux';

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
    <div className="min-h-screen bg-richblack-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="sm:fixed sm:left-0 sm:top-16 h-[calc(100vh-4rem)] z-30 transition-all duration-300">
          <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        {/* Main Content */}
        <div className={`flex-1 mt-16 min-h-[calc(100vh-4rem)] transition-all duration-300 ${
          isCollapsed ? 'sm:ml-16' : 'sm:ml-64'
        } w-full px-4 sm:px-0`}>
          <div className="p-4 sm:p-6 overflow-x-hidden">
            {/* Header */}
            <div className="mb-4 sm:mb-8 bg-richblack-800 border border-richblack-700 p-4 sm:p-6 rounded-xl shadow-md">
              <h1 className="text-2xl sm:text-3xl font-bold text-richblack-5">
                {showCreateCourse ? 'Create Course' : sidebarItems.find(item => item.id === activeTab)?.label}
              </h1>
              <p className="text-richblack-200 mt-2">
                Manage your platform efficiently with these tools
              </p>
            </div>

            {/* Content */}
            <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-4 sm:p-6 shadow-md">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
