import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { FiBook, FiUser, FiDollarSign, FiTag, FiSettings, FiSearch, FiFilter, FiCalendar } from 'react-icons/fi'
import { getAllCourses, setCourseType } from '../../../../services/operations/adminAPI'
import { formatDate, getRelativeTime } from '../../../../utils/dateFormatter'
import toast from 'react-hot-toast'

export default function CourseTypeManager() {
  const { token } = useSelector((state) => state.auth)
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [processingId, setProcessingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    let filtered = courses
    
    // Filter by type
    if (typeFilter !== 'All') {
      filtered = filtered.filter(course => course.courseType === typeFilter)
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredCourses(filtered)
  }, [typeFilter, courses, searchTerm])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const result = await getAllCourses(token)
      if (result) {
        setCourses(result)
      }
    } catch (error) {
      toast.error('Failed to fetch courses')
    }
    setLoading(false)
  }

  const handleCourseTypeChange = async (courseId, courseType) => {
    setProcessingId(courseId)
    try {
      const result = await setCourseType(courseId, courseType, token)
      if (result) {
        toast.success(`Course type changed to ${courseType}`)
        // Update the local state with the data returned from backend
        setCourses(courses.map(course => 
          course._id === courseId 
            ? {
                ...course,
                ...result,
                courseType: result.courseType,
                price: result.price,
                originalPrice: result.originalPrice,
                adminSetFree: result.adminSetFree
              }
            : course
        ))
      }
    } catch (error) {
      toast.error(`Failed to change course type`)
    }
    setProcessingId(null)
  }

  const getCourseStats = () => {
    const stats = {
      total: courses.length,
      free: courses.filter(c => c.courseType === 'Free').length,
      paid: courses.filter(c => c.courseType === 'Paid').length,
      noInstructor: courses.filter(c => !c.instructor).length
    }
    return stats
  }

  const stats = getCourseStats()

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Header Section */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Course Type Management
            </h1>
            <p className="text-slate-400 mt-2">
              Manage course pricing and availability settings
            </p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-700/30 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-slate-400">Total</p>
            </div>
            <div className="bg-green-500/10 rounded-xl p-3 text-center border border-green-500/20">
              <p className="text-2xl font-bold text-green-400">{stats.free}</p>
              <p className="text-xs text-green-400">Free</p>
            </div>
            <div className="bg-yellow-500/10 rounded-xl p-3 text-center border border-yellow-500/20">
              <p className="text-2xl font-bold text-yellow-400">{stats.paid}</p>
              <p className="text-xs text-yellow-400">Paid</p>
            </div>
            <div className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20">
              <p className="text-2xl font-bold text-red-400">{stats.noInstructor}</p>
              <p className="text-xs text-red-400">No Instructor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search courses or instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
          
          {/* Type Filter */}
          <div className="flex items-center gap-3">
            <FiFilter className="text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
            >
              <option value="All">All Types</option>
              <option value="Free">Free Courses</option>
              <option value="Paid">Paid Courses</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDelay: '0.15s' }}></div>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
              <FiBook className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {courses.length === 0 ? 'No courses found' : 'No matching courses'}
            </h3>
            <p className="text-slate-400 text-center max-w-md">
              {courses.length === 0 
                ? "No courses are available in the system yet."
                : "No courses match your current filters. Try adjusting your search or filter criteria."
              }
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">
                      <div className="flex items-center gap-2">
                        <FiBook className="w-4 h-4" />
                        Course
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">
                      <div className="flex items-center gap-2">
                        <FiUser className="w-4 h-4" />
                        Instructor
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="w-4 h-4" />
                        Original Price
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="w-4 h-4" />
                        Current Price
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">
                      <div className="flex items-center gap-2">
                        <FiTag className="w-4 h-4" />
                        Type
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300 min-w-[150px]">
                      <div className="flex items-center gap-2">
                        <FiSettings className="w-4 h-4" />
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredCourses.map((course) => (
                    <tr key={course._id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative group-hover:scale-105 transition-transform duration-300">
                            <img
                              src={course.thumbnail}
                              alt={course.courseName}
                              className="w-16 h-10 rounded-lg object-cover ring-2 ring-slate-600/50"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-white line-clamp-1">{course.courseName}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                              <FiCalendar className="w-3 h-3" />
                              <span>{getRelativeTime(course.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {course.instructor ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={course.instructor.image}
                              alt={course.instructor.firstName}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-600/50"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-white">
                                {course.instructor.firstName} {course.instructor.lastName}
                              </p>
                              <p className="text-sm text-slate-400 truncate">
                                {course.instructor.email}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-400">
                            <FiUser className="w-4 h-4" />
                            <span className="text-sm">No instructor assigned</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-white font-medium">₹{course.originalPrice}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-medium ${
                          course.courseType === 'Free' 
                            ? 'text-green-400' 
                            : 'text-yellow-400'
                        }`}>
                          {course.courseType === 'Free' ? 'Free' : `₹${course.price}`}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          course.courseType === 'Free' 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {course.courseType}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {course.courseType === 'Paid' ? (
                          <button
                            onClick={() => handleCourseTypeChange(course._id, 'Free')}
                            disabled={processingId === course._id}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiTag className="w-4 h-4" />
                            <span className="text-sm font-medium">Make Free</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCourseTypeChange(course._id, 'Paid')}
                            disabled={processingId === course._id}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiDollarSign className="w-4 h-4" />
                            <span className="text-sm font-medium">Make Paid</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 p-6">
              {filteredCourses.map((course) => (
                <div key={course._id} className="bg-slate-700/30 rounded-2xl p-6 space-y-4 hover:bg-slate-700/40 transition-colors group">
                  {/* Course Header */}
                  <div className="flex gap-4">
                    <div className="relative group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={course.thumbnail}
                        alt={course.courseName}
                        className="w-20 h-14 rounded-xl object-cover ring-2 ring-slate-600/50"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg line-clamp-2 mb-2">
                        {course.courseName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <FiCalendar className="w-4 h-4" />
                        <span>Created {getRelativeTime(course.createdAt)}</span>
                      </div>
                    </div>
                    {/* Type Badge */}
                    <div className="flex-shrink-0">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        course.courseType === 'Free' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {course.courseType}
                      </span>
                    </div>
                  </div>

                  {/* Instructor Info */}
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    {course.instructor ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={course.instructor.image}
                          alt={course.instructor.firstName}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-600/50"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <FiUser className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-300">Instructor</span>
                          </div>
                          <p className="font-medium text-white">
                            {course.instructor.firstName} {course.instructor.lastName}
                          </p>
                          <p className="text-sm text-slate-400">
                            {course.instructor.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-400">
                        <FiUser className="w-4 h-4" />
                        <span className="text-sm font-medium">No instructor assigned</span>
                      </div>
                    )}
                  </div>

                  {/* Pricing Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FiDollarSign className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-300">Original Price</span>
                      </div>
                      <p className="text-xl font-bold text-white">₹{course.originalPrice}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FiTag className="w-4 h-4 text-slate-400" />
                      </div>
                      <p className={`text-xl font-bold ${
                        course.courseType === 'Free' 
                          ? 'text-green-400' 
                          : 'text-yellow-400'
                      }`}>
                        {course.courseType === 'Free' ? 'Free' : `₹${course.price}`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      course.courseType === 'Free' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {course.courseType}
                    </span>
                    {course.courseType === 'Paid' ? (
                      <button
                        onClick={() => handleCourseTypeChange(course._id, 'Free')}
                        disabled={processingId === course._id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiTag className="w-4 h-4" />
                        <span className="text-sm font-medium">Make Free</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCourseTypeChange(course._id, 'Paid')}
                        disabled={processingId === course._id}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiDollarSign className="w-4 h-4" />
                        <span className="text-sm font-medium">Make Paid</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
