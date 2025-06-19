import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getFreeCourses, requestCourseAccess, getUserAccessRequests } from '../../../services/operations/courseAccessAPI'
import CourseCard from './CourseCard'
import { toast } from 'react-hot-toast'

export default function FreeCourses() {
  const { token, user } = useSelector((state) => state.auth)
  const [freeCourses, setFreeCourses] = useState([])
  const [userRequests, setUserRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchFreeCourses()
    if (token) {
      fetchUserRequests()
    }
  }, [currentPage])

  const fetchFreeCourses = async () => {
    setLoading(true)
    const result = await getFreeCourses(currentPage)
    if (result?.data) {
      setFreeCourses(result.data)
      setTotalPages(result.pagination?.totalPages || 1)
    } else {
      setFreeCourses([])
      setTotalPages(1)
    }
    setLoading(false)
  }

  const fetchUserRequests = async () => {
    const result = await getUserAccessRequests(token)
    if (result) {
      setUserRequests(result)
    }
  }

  const handleRequestAccess = async (courseId, courseName) => {
    if (!token) {
      toast.error('Please login to request access')
      return
    }

    const requestMessage = `I would like to request access to the course "${courseName}".`
    
    const result = await requestCourseAccess(
      { 
        courseId, 
        requestMessage 
      }, 
      `Bearer ${token}`
    )
    if (result) {
      fetchUserRequests() // Refresh user requests
    }
  }

  const getRequestStatus = (courseId) => {
    const request = userRequests.find(req => req?.course?._id === courseId)
    return request ? request.status : null
  }

  const isEnrolled = (courseId) => {
    return user?.courses?.includes(courseId)
  }

  return (
    <div className="mx-auto w-11/12 max-w-maxContent py-8 sm:py-12">
      <div className="section_heading px-4 sm:px-0">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-richblack-5">Free Courses</h1>
        <p className="mt-2 sm:mt-3 text-base sm:text-lg lg:text-xl text-richblack-200">
          Explore our collection of free courses. Request access to start learning!
        </p>
      </div>

      {loading ? (
        <div className="flex h-[calc(100vh-20rem)] items-center justify-center">
          <div className="spinner"></div>
        </div>
      ) : freeCourses.length === 0 ? (
        <p className="flex h-[calc(100vh-20rem)] items-center justify-center text-richblack-5 text-center px-4">
          No free courses available at the moment
        </p>
      ) : (
        <>
          <div className="my-6 sm:my-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 px-4 sm:px-0 place-items-center">
            {freeCourses.map((course) => {
              const requestStatus = getRequestStatus(course._id)
              const enrolled = isEnrolled(course._id)
              
              return (
                <div key={course._id} className="relative">
                  <CourseCard course={course} />
                  
                  {/* Access Status Overlay - positioned at bottom of card */}
                  <div className="absolute bottom-0 left-0 right-0 bg-richblack-900/90 backdrop-blur-sm p-3 rounded-b-xl">
                    <div className="flex items-center justify-between gap-2">
                      {enrolled ? (
                        <span className="rounded-full bg-blue-200 px-3 py-1 text-xs font-medium text-richblack-900">
                          Enrolled
                        </span>
                      ) : requestStatus ? (
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                          requestStatus === 'Pending' 
                            ? 'bg-yellow-200 text-richblack-900'
                            : requestStatus === 'Approved'
                            ? 'bg-caribbeangreen-200 text-richblack-900'
                            : 'bg-pink-200 text-richblack-900'
                        }`}>
                          {requestStatus}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRequestAccess(course._id, course.courseName)}
                          className="rounded-md bg-caribbeangreen-300 hover:bg-caribbeangreen-400 px-4 py-2 text-xs font-bold text-richblack-900 transition-colors shadow-md"
                        >
                          Request Access
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 px-4 sm:px-0">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-md bg-richblack-700 px-3 py-1.5 sm:px-4 sm:py-2 text-sm text-richblack-50 disabled:opacity-50 hover:bg-richblack-600 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm sm:text-base text-richblack-50">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-md bg-richblack-700 px-3 py-1.5 sm:px-4 sm:py-2 text-sm text-richblack-50 disabled:opacity-50 hover:bg-richblack-600 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
