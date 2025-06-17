import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaBookOpen, FaChartBar, FaGraduationCap } from 'react-icons/fa';
import { MdSettings } from 'react-icons/md';

import UserManagement from './components/UserManagement';
import CourseManagement from './components/CourseManagement';
import CreateCourse from './components/CreateCourse/CreateCourse';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import CourseTypeManager from '../../components/core/Dashboard/Admin/CourseTypeManager';
import CourseAccessRequests from '../../components/core/Dashboard/Admin/CourseAccessRequests';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [showCreateCourse, setShowCreateCourse] = useState(false);

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'users', label: 'Users', icon: <FaUsers className="w-5 h-5" /> },
    { id: 'courses', label: 'Courses', icon: <FaBookOpen className="w-5 h-5" /> },
    { id: 'courseTypes', label: 'Course Types', icon: <FaGraduationCap className="w-5 h-5" /> },
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
    <div className="min-h-screen bg-richblack-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-richblack-800 min-h-screen p-4">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-yellow-50">Admin Dashboard</h2>
          </div>
          <nav>
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
                  activeTab === item.id && !showCreateCourse
                    ? 'bg-yellow-50 text-richblack-900'
                    : 'text-richblack-25 hover:bg-richblack-700'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-richblack-5">
              {showCreateCourse ? 'Create Course' : sidebarItems.find(item => item.id === activeTab)?.label}
            </h1>
          </div>

          {/* Content based on active tab */}
          <div className="bg-richblack-800 rounded-lg p-6">
            {showCreateCourse ? (
              <CreateCourse onCancel={() => setShowCreateCourse(false)} />
            ) : (
              <>
                {activeTab === 'users' && <UserManagement />}
                {activeTab === 'courses' && <CourseManagement onCreateCourse={handleCreateCourse} />}
                {activeTab === 'courseTypes' && <CourseTypeManager />}
                {activeTab === 'accessRequests' && <CourseAccessRequests />}
                {activeTab === 'analytics' && <Analytics />}
                {activeTab === 'settings' && <Settings />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
