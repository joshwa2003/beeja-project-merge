import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaBookOpen, FaChartBar, FaGraduationCap, FaQuestionCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { MdSettings } from 'react-icons/md';
import { toggleSidebarCollapse } from '../../slices/sidebarSlice';

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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [showCreateCourse, setShowCreateCourse] = useState(false);

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'users', label: 'Users', icon: <FaUsers className="w-5 h-5" /> },
    { id: 'courses', label: 'Courses', icon: <FaBookOpen className="w-5 h-5" /> },
    { id: 'courseTypes', label: 'Course Types', icon: <FaGraduationCap className="w-5 h-5" /> },
    { id: 'quizzes', label: 'Quiz Management', icon: <FaQuestionCircle className="w-5 h-5" /> },
    { id: 'accessRequests', label: 'Access Requests', icon: <FaUsers className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <FaChartBar className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <MdSettings className="w-5 h-5" /> },
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
    <div className="min-h-screen dashboard-gradient">
      <div className="flex">
        {/* Sidebar */}
        <div className={`${isCollapsed ? 'w-20' : 'w-64'} card-gradient min-h-screen p-4 modern-scrollbar transition-all duration-300`}>
          <div className="mb-8 glass-effect p-4 rounded-xl flex items-center justify-between">
            {!isCollapsed && (
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200">
                Admin Dashboard
              </h2>
            )}
              <button
              onClick={() => dispatch(toggleSidebarCollapse())}
              className="text-yellow-50 hover:text-yellow-200 transition-colors p-2 rounded-full hover:bg-[#ffffff1a]"
            >
              {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          </div>
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`admin-tab w-full flex items-center justify-center ${!isCollapsed ? 'space-x-3 justify-start' : ''} px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === item.id && !showCreateCourse
                    ? 'active'
                    : 'text-richblack-25'
                }`}
              >
                <div className="relative group flex items-center justify-center">
                  <span className="text-lg">{item.icon}</span>
                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-richblack-800 text-yellow-50 text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </div>
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 modern-scrollbar">
          <div className="mb-8 glass-effect p-6 rounded-xl fade-in-up">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200">
              {showCreateCourse ? 'Create Course' : sidebarItems.find(item => item.id === activeTab)?.label}
            </h1>
            <p className="text-richblack-200 mt-2 opacity-75">
              Manage your platform efficiently with these tools
            </p>
          </div>

          {/* Content based on active tab */}
          <div className="card-gradient rounded-xl p-6 glass-effect slide-in-right">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
