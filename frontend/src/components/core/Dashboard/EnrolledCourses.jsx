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

  // fetch all users enrolled courses
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
  const sklItem = () => {
    return (
      <div className="flex border border-richblack-700 px-5 py-3 w-full">
        <div className="flex flex-1 gap-x-4 ">
          <div className='h-14 w-14 rounded-lg skeleton '></div>

          <div className="flex flex-col w-[40%] ">
            <p className="h-2 w-[50%] rounded-xl  skeleton"></p>
            <p className="h-2 w-[70%] rounded-xl mt-3 skeleton"></p>
          </div>
        </div>

        <div className="flex flex-[0.4] flex-col ">
          <p className="h-2 w-[20%] rounded-xl skeleton mt-2"></p>
          <p className="h-2 w-[40%] rounded-xl skeleton mt-3"></p>
        </div>
      </div>
    )
  }

  // return if data is null
  if (enrolledCourses?.length == 0) {
    return (
      <p className="grid h-[50vh] w-full place-content-center text-center text-richblack-5 text-3xl">
        You have not enrolled in any course yet.
      </p>)
  }



  return (
    <div className="fade-in-up">
      <div className="glass-effect p-6 rounded-xl mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200 text-center sm:text-left">
          Enrolled Courses
        </h1>
        <p className="text-richblack-200 mt-2 opacity-75">
          Continue your learning journey
        </p>
      </div>

      <div className="card-gradient rounded-xl p-6 glass-effect">
        {/* Headings */}
        <div className="hidden sm:flex rounded-xl stats-card p-4 mb-4">
          <p className="w-[45%] px-3 py-2 font-semibold text-richblack-5">Course Name</p>
          <p className="w-1/4 px-2 py-2 font-semibold text-richblack-5">Duration</p>
          <p className="flex-1 px-2 py-2 font-semibold text-richblack-5">Progress</p>
        </div>

        {/* loading Skeleton */}
        {!enrolledCourses && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="course-card p-4 rounded-xl">
                {sklItem()}
              </div>
            ))}
          </div>
        )}

        {/* Course Cards */}
        <div className="space-y-4">
          {enrolledCourses?.map((course, i) => (
            <div
              key={i}
              className="course-card rounded-xl overflow-hidden transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center p-4">
                <div
                  className="flex sm:w-[45%] cursor-pointer items-center gap-4 group"
                  onClick={() => {
                    navigate(
                      `/view-course/${course?._id}/section/${course.courseContent?.[0]?._id}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`
                    )
                  }}
                >
                  <div className="relative">
                    <Img
                      src={course.thumbnail}
                      alt="course_img"
                      className="h-16 w-16 rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <div className="flex max-w-xs flex-col gap-2">
                    <p className="font-semibold text-richblack-5 group-hover:text-yellow-50 transition-colors duration-300">
                      {course.courseName}
                    </p>
                    <p className="text-xs text-richblack-300">
                      {course.courseDescription.length > 50
                        ? `${course.courseDescription.slice(0, 50)}...`
                        : course.courseDescription}
                    </p>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className='sm:hidden mt-4 space-y-3'>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-yellow-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-richblack-300">{course?.totalDuration}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-richblack-300">Progress</span>
                      <span className="text-sm font-semibold text-yellow-50">{course.progressPercentage || 0}%</span>
                    </div>
                    <ProgressBar
                      completed={course.progressPercentage || 0}
                      height="8px"
                      isLabelVisible={false}
                      bgColor="linear-gradient(135deg, #fbbf24, #f59e0b)"
                      baseBgColor="#374151"
                    />
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex sm:w-1/4 items-center gap-2 px-2">
                  <svg className="w-4 h-4 text-yellow-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-richblack-300">{course?.totalDuration}</span>
                </div>

                <div className="hidden sm:flex sm:flex-1 flex-col gap-2 px-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-richblack-300">Progress</span>
                    <span className="text-sm font-semibold text-yellow-50">{course.progressPercentage || 0}%</span>
                  </div>
                  <ProgressBar
                    completed={course.progressPercentage || 0}
                    height="8px"
                    isLabelVisible={false}
                    bgColor="linear-gradient(135deg, #fbbf24, #f59e0b)"
                    baseBgColor="#374151"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}