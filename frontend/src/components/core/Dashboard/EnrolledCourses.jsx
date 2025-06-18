import { useEffect, useState } from "react"
import ProgressBar from "@ramonak/react-progress-bar"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI"
import Img from './../../common/Img';

export default function EnrolledCourses() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [enrolledCourses, setEnrolledCourses] = useState(null)

  const getEnrolledCourses = async () => {
    try {
      const res = await getUserEnrolledCourses(token);
      setEnrolledCourses(res);
    } catch (error) {
      console.log("Could not fetch enrolled courses.")
    }
  };

  useEffect(() => {
    getEnrolledCourses();
  }, [])

  // Loading Skeleton
  const SkeletonCard = () => (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 animate-pulse">
      <div className="flex gap-6">
        <div className="h-20 w-20 rounded-xl bg-slate-700/50"></div>
        <div className="flex-1 space-y-4">
          <div className="h-4 w-3/4 rounded bg-slate-700/50"></div>
          <div className="h-3 w-1/2 rounded bg-slate-700/50"></div>
          <div className="h-2 w-full rounded bg-slate-700/50"></div>
        </div>
      </div>
    </div>
  )

  if (enrolledCourses?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-24 h-24 mb-8 text-slate-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Courses Yet</h2>
        <p className="text-slate-400 mb-8">You haven't enrolled in any courses. Start your learning journey today!</p>
        <button 
          onClick={() => navigate('/catalog')}
          className="px-6 py-3 bg-purple-500/10 text-purple-400 rounded-xl hover:bg-purple-500/20 transition-all duration-300"
        >
          Browse Courses
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Enrolled Courses
        </h1>
        <p className="text-slate-400 mt-2">
          Continue your learning journey
        </p>
      </div>

      {/* Course List */}
      <div className="space-y-4">
        {/* Loading State */}
        {!enrolledCourses && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {/* Course Cards */}
        {enrolledCourses?.map((course, i) => (
          <div
            key={i}
            className="group bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Thumbnail */}
                <div 
                  className="relative cursor-pointer"
                  onClick={() => navigate(`/view-course/${course?._id}/section/${course.courseContent?.[0]?._id}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`)}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                  <div className="relative">
                    <Img
                      src={course.thumbnail}
                      alt={course.courseName}
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                  </div>
                </div>

                {/* Course Info */}
                <div className="flex-1 min-w-0">
                  <h3 
                    className="text-lg font-semibold text-white mb-2 cursor-pointer hover:text-purple-400 transition-colors duration-300"
                    onClick={() => navigate(`/view-course/${course?._id}/section/${course.courseContent?.[0]?._id}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`)}
                  >
                    {course.courseName}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                    {course.courseDescription}
                  </p>

                  {/* Progress Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">{course?.totalDuration}</span>
                      </div>
                      <span className="text-sm font-medium text-purple-400">
                        {course.progressPercentage || 0}% Complete
                      </span>
                    </div>
                    <ProgressBar
                      completed={course.progressPercentage || 0}
                      height="8px"
                      isLabelVisible={false}
                      bgColor="linear-gradient(90deg, #8B5CF6, #3B82F6)"
                      baseBgColor="#1F2937"
                      className="rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
