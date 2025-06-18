import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"

import { fetchInstructorCourses } from "../../../services/operations/courseDetailsAPI"
import { getInstructorData } from "../../../services/operations/profileAPI"
import InstructorChart from "./InstructorDashboard/InstructorChart"
import Img from './../../common/Img';



export default function Instructor() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const [loading, setLoading] = useState(false)
  const [instructorData, setInstructorData] = useState(null)
  const [courses, setCourses] = useState([])


  // get Instructor Data
  useEffect(() => {
    ; (async () => {
      setLoading(true)
      const instructorApiData = await getInstructorData(token)
      const result = await fetchInstructorCourses(token)
      // console.log('INSTRUCTOR_API_RESPONSE.....', instructorApiData)
      if (instructorApiData.length) setInstructorData(instructorApiData)
      if (result) {
        setCourses(result)
      }
      setLoading(false)
    })()
  }, [])

  const totalAmount = instructorData?.reduce((acc, curr) => acc + curr.totalAmountGenerated, 0)

  const totalStudents = instructorData?.reduce((acc, curr) => acc + curr.totalStudentsEnrolled, 0)


  // skeleton loading
  const skItem = () => {
    return (
      <div className="mt-5 w-full flex flex-col justify-between  rounded-xl ">
        <div className="flex border p-4 border-richblack-600 ">
          <div className="w-full">
            <p className="w-[100px] h-4 rounded-xl skeleton"></p>
            <div className="mt-3 flex gap-x-5">
              <p className="w-[200px] h-4 rounded-xl skeleton"></p>
              <p className="w-[100px] h-4 rounded-xl skeleton"></p>
            </div>

            <div className="flex justify-center items-center flex-col">
              <div className="w-[80%] h-24 rounded-xl mt-5 skeleton"></div>
              {/* circle */}
              <div className="w-60 h-60 rounded-full  mt-4 grid place-items-center skeleton"></div>
            </div>
          </div>
          {/* right column */}
          <div className="sm:flex hidden min-w-[250px] flex-col rounded-xl p-6 skeleton"></div>
        </div>

        {/* bottom row */}
        <div className="flex flex-col gap-y-6  mt-5">
          <div className="flex justify-between">
            <p className="text-lg font-bold text-richblack-5 pl-5">Your Courses</p>
            <Link to="/dashboard/my-courses">
              <p className="text-xs font-semibold text-yellow-50 hover:underline pr-5">View All</p>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row  gap-6 ">
            <p className=" h-[201px] w-full rounded-xl  skeleton"></p>
            <p className=" h-[201px] w-full rounded-xl  skeleton"></p>
            <p className=" h-[201px] w-full rounded-xl  skeleton"></p>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="fade-in-up">
      <div className="space-y-2 glass-effect p-6 rounded-xl mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200 text-center sm:text-left">
          Hi {user?.firstName} 👋
        </h1>
        <p className="font-medium text-richblack-200 text-center sm:text-left opacity-75">
          Welcome back to your instructor dashboard
        </p>
      </div>


      {loading ? (
        <div>
          {skItem()}
        </div>
      )
        :
        courses.length > 0 ? (
          <div>
            <div className="my-4 flex flex-col md:flex-row h-auto md:h-[450px] space-y-4 md:space-y-0 md:space-x-4">
              {/* Render chart / graph */}
              {totalAmount > 0 || totalStudents > 0 ? (
                <InstructorChart courses={instructorData} />
              ) : (
                <div className="flex-1 rounded-xl card-gradient p-6 glass-effect">
                  <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200">Visualize</p>
                  <p className="mt-4 text-xl font-medium text-richblack-50 opacity-75">
                    Not Enough Data To Visualize
                  </p>
                </div>
              )}

              {/* left column */}
              {/* Total Statistics */}
              <div className="flex min-w-[250px] flex-col rounded-xl stats-card p-6">
                <p className="text-lg font-bold text-richblack-5">Statistics</p>
                <div className="mt-4 space-y-6">
                  <div className="metric-card p-4 rounded-lg">
                    <p className="text-lg text-richblack-200">Total Courses</p>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200">
                      {courses.length}
                    </p>
                  </div>
                  <div className="metric-card p-4 rounded-lg">
                    <p className="text-lg text-richblack-200">Total Students</p>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200">
                      {totalStudents}
                    </p>
                  </div>
                  <div className="metric-card p-4 rounded-lg">
                    <p className="text-lg text-richblack-200">Total Income</p>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200">
                      Rs. {totalAmount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Render 3 courses */}
            <div className="rounded-xl card-gradient p-6 glass-effect">
              <div className="flex items-center justify-between mb-6">
                <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200">Your Courses</p>
                <Link to="/dashboard/my-courses" className="text-xs font-semibold text-yellow-50 hover:text-yellow-100 transition-colors duration-200 flex items-center gap-2">
                  View All
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.slice(0, 3).map((course) => (
                  <div key={course._id} className="course-card rounded-xl overflow-hidden">
                    <Img
                      src={course.thumbnail}
                      alt={course.courseName}
                      className="h-[201px] w-full rounded-2xl object-cover"
                    />

                    <div className="p-4">
                      <p className="text-sm font-semibold text-richblack-5 mb-2">
                        {course.courseName}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-richblack-300 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          {course.studentsEnrolled.length}
                        </p>
                        <p className="text-xs font-medium text-yellow-50">
                          Rs. {course.price}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-20 rounded-md bg-richblack-800 p-6 py-20">
            <p className="text-center text-2xl font-bold text-richblack-5">
              You have not created any courses yet
            </p>
            <p className="mt-1 text-center text-lg text-richblack-300">
              Contact admin to create a new course
            </p>
          </div>
        )}
    </div>
  )
}
