import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getAnalytics } from "../../../services/operations/adminAPI";
import { FaUsers, FaGraduationCap, FaChalkboardTeacher, FaUserShield } from "react-icons/fa";

const Analytics = () => {
  const { token } = useSelector((state) => state.auth);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch analytics from backend API
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const analyticsData = await getAnalytics(token);
      setAnalytics(analyticsData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <p className="text-richblack-5">Loading analytics...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!analytics) return null;

  return (
    <div className="text-richblack-5">
      <h4 className="text-lg font-semibold mb-6">Analytics Dashboard</h4>
      
      <div className="space-y-8">
        {/* User Statistics */}
        <div>
          <h5 className="text-xl font-semibold mb-4">User Statistics</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-richblack-700 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-richblack-50">Total Users</p>
                  <p className="text-3xl font-bold text-yellow-50">{analytics.users.total}</p>
                </div>
                <FaUsers className="text-yellow-50 text-3xl" />
              </div>
            </div>
            
            <div className="bg-richblack-700 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-richblack-50">Students</p>
                  <p className="text-3xl font-bold text-blue-400">{analytics.users.students}</p>
                </div>
                <FaGraduationCap className="text-blue-400 text-3xl" />
              </div>
            </div>
            
            <div className="bg-richblack-700 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-richblack-50">Instructors</p>
                  <p className="text-3xl font-bold text-green-400">{analytics.users.instructors}</p>
                </div>
                <FaChalkboardTeacher className="text-green-400 text-3xl" />
              </div>
            </div>
            
            <div className="bg-richblack-700 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-richblack-50">Admins</p>
                  <p className="text-3xl font-bold text-red-400">{analytics.users.admins}</p>
                </div>
                <FaUserShield className="text-red-400 text-3xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Course Statistics */}
        <div>
          <h5 className="text-xl font-semibold mb-4">Course Statistics</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-richblack-700 p-6 rounded-lg">
              <p className="text-sm text-richblack-50">Total Courses</p>
              <p className="text-3xl font-bold text-yellow-50">{analytics.courses.total}</p>
            </div>
            
            <div className="bg-richblack-700 p-6 rounded-lg">
              <p className="text-sm text-richblack-50">Published Courses</p>
              <p className="text-3xl font-bold text-green-400">{analytics.courses.published}</p>
            </div>
            
            <div className="bg-richblack-700 p-6 rounded-lg">
              <p className="text-sm text-richblack-50">Draft Courses</p>
              <p className="text-3xl font-bold text-yellow-400">{analytics.courses.draft}</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h5 className="text-xl font-semibold mb-4">Recent Activity</h5>
          <div className="bg-richblack-700 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-richblack-50">New Registrations (Last 30 days)</p>
                <p className="text-2xl font-bold text-yellow-50">{analytics.users.recentRegistrations}</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Distribution Chart */}
        <div>
          <h5 className="text-xl font-semibold mb-4">User Distribution</h5>
          <div className="bg-richblack-700 p-6 rounded-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Students</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-richblack-600 rounded-full h-2">
                    <div 
                      className="bg-blue-400 h-2 rounded-full" 
                      style={{width: `${(analytics.users.students / analytics.users.total) * 100}%`}}
                    />
                  </div>
                  <span className="text-sm">{Math.round((analytics.users.students / analytics.users.total) * 100)}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Instructors</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-richblack-600 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full" 
                      style={{width: `${(analytics.users.instructors / analytics.users.total) * 100}%`}}
                    />
                  </div>
                  <span className="text-sm">{Math.round((analytics.users.instructors / analytics.users.total) * 100)}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Admins</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-richblack-600 rounded-full h-2">
                    <div 
                      className="bg-red-400 h-2 rounded-full" 
                      style={{width: `${(analytics.users.admins / analytics.users.total) * 100}%`}}
                    />
                  </div>
                  <span className="text-sm">{Math.round((analytics.users.admins / analytics.users.total) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
