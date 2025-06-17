import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getAllCourses, approveCourse, deleteCourse, toggleCourseVisibility } from "../../../services/operations/adminAPI";
import { FaCheck, FaTrash, FaEye, FaEyeSlash, FaPlus } from "react-icons/fa";
import { toast } from "react-hot-toast";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import CreateCourse from "./CreateCourse/CreateCourse";

const CourseManagement = () => {
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch courses from backend API
  const fetchCourses = async () => {
    setLoading(true);
    try {
      console.log("Fetching courses...");
      const courses = await getAllCourses(token);
      console.log("Courses fetched:", courses);
      setCourses(courses);
      setError(null);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err.message || 'Failed to fetch courses');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleApproveCourse = async (courseId) => {
    try {
      await approveCourse(courseId, token);
      fetchCourses(); // Refresh course list
    } catch (error) {
      setError(error.message);
    }
  };

  const [confirmationModal, setConfirmationModal] = useState(null);
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [togglingCourseId, setTogglingCourseId] = useState(null);

  const handleDeleteCourse = async (courseId) => {
    if (!token) {
      toast.error("Authentication token is missing");
      return;
    }

    try {
      setDeletingCourseId(courseId);
      setError(null);

      // Log deletion attempt
      console.log('Attempting to delete course:', {
        courseId,
        tokenExists: !!token
      });
      
      const result = await deleteCourse(courseId, token);
      
      if (result) {
        toast.success("Course deleted successfully");
        setConfirmationModal(null);
        await fetchCourses(); // Refresh course list
      }
      
    } catch (error) {
      console.error('Delete operation failed:', {
        error: error.message,
        courseId,
        response: error.response?.data
      });
      
      // Show specific error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete course';
      setError(errorMessage);
      toast.error(errorMessage);
      
    } finally {
      setDeletingCourseId(null);
    }
  };

  const handleToggleVisibility = async (courseId) => {
    if (!token) {
      toast.error("Authentication token is missing");
      return;
    }
    try {
      console.log("Toggling visibility for course:", courseId);
      setTogglingCourseId(courseId);
      const response = await toggleCourseVisibility(courseId, token);
      if (response) {
        toast.success("Course visibility updated successfully");
        await fetchCourses(); // Refresh the course list
      }
    } catch (error) {
      console.error('Toggle course visibility failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update course visibility');
    } finally {
      setTogglingCourseId(null);
    }
  };

  const handleViewCourse = (courseId) => {
    // Implement course preview/details view
    console.log("View course:", courseId);
  };

  // Calculate statistics
  const totalCourses = courses.length;
  const pendingCourses = courses.filter(course => !course.status || course.status === 'Draft').length;
  const activeCourses = courses.filter(course => course.status === 'Published').length;

  return (
    <div className="text-richblack-5">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-lg font-semibold">Course Management</h4>
          <button
            onClick={() => setShowCreateCourse(true)}
            className="flex items-center gap-2 bg-yellow-50 text-richblack-900 px-4 py-2 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            Create Course
          </button>
        </div>
        
        {/* Course Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-richblack-700 p-4 rounded-lg">
            <h5 className="text-sm text-richblack-50">Total Courses</h5>
            <p className="text-2xl font-bold text-yellow-50">{totalCourses}</p>
          </div>
          <div className="bg-richblack-700 p-4 rounded-lg">
            <h5 className="text-sm text-richblack-50">Pending Approval</h5>
            <p className="text-2xl font-bold text-yellow-50">{pendingCourses}</p>
          </div>
          <div className="bg-richblack-700 p-4 rounded-lg">
            <h5 className="text-sm text-richblack-50">Active Courses</h5>
            <p className="text-2xl font-bold text-yellow-50">{activeCourses}</p>
          </div>
        </div>
      </div>

      {loading && <p>Loading courses...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {showCreateCourse ? (
        <CreateCourse onCancel={() => setShowCreateCourse(false)} />
      ) : !loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-richblack-700">
                <th className="p-4 border border-richblack-600">Title</th>
                <th className="p-4 border border-richblack-600">Instructor</th>
                <th className="p-4 border border-richblack-600">Category</th>
                <th className="p-4 border border-richblack-600">Price</th>
                <th className="p-4 border border-richblack-600">Status</th>
                <th className="p-4 border border-richblack-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center">No courses found.</td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course._id} className="border-b border-richblack-600">
                    <td className="p-4">{course.courseName}</td>
                    <td className="p-4">
                      {course.instructor?.firstName} {course.instructor?.lastName}
                    </td>
                    <td className="p-4">{course.category?.name || 'N/A'}</td>
                    <td className="p-4">₹{course.price}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded ${
                        course.status === 'Published'
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-yellow-600/20 text-yellow-400'
                      }`}>
                        {course.status || 'Draft'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-3">
                        {(!course.status || course.status === 'Draft') && (
                          <button
                            onClick={() => handleApproveCourse(course._id)}
                            className="text-green-500 hover:text-green-600"
                            title="Approve Course"
                          >
                            <FaCheck size={20} />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleVisibility(course._id)}
                          className={`${course.isVisible ? 'text-green-500' : 'text-gray-500'} hover:text-green-600`}
                          disabled={togglingCourseId === course._id}
                          title={course.isVisible ? 'Hide Course' : 'Show Course'}
                        >
                          {togglingCourseId === course._id ? (
                            <div className="w-5 h-5 animate-spin rounded-full border-b-2 border-green-500"/>
                          ) : (
                            course.isVisible ? <FaEye size={20} /> : <FaEyeSlash size={20} />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setConfirmationModal({
                              text1: "Delete Course?",
                              text2: "This action cannot be undone. The course will be permanently deleted.",
                              btn1Text: "Delete",
                              btn2Text: "Cancel",
                              btn1Handler: () => handleDeleteCourse(course._id),
                              btn2Handler: () => setConfirmationModal(null),
                            })
                          }}
                          disabled={deletingCourseId === course._id}
                          className={`text-red-500 hover:text-red-600 ${
                            deletingCourseId === course._id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          title="Delete Course"
                        >
                          {deletingCourseId === course._id ? (
                            <div className="w-5 h-5 animate-spin rounded-full border-b-2 border-red-500"/>
                          ) : (
                            <FaTrash size={20} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Confirmation Modal */}
      {confirmationModal && (
        <ConfirmationModal
          modalData={confirmationModal}
          closeModal={() => setConfirmationModal(null)}
        />
      )}
    </div>
  );
};

export default CourseManagement;
