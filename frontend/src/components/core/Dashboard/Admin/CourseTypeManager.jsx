import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Table, Thead, Tbody, Tr, Th, Td } from './Table'
import { getAllCourses, setCourseType } from '../../../../services/operations/adminAPI'
import { formatDate } from '../../../../utils/dateFormatter'
import IconBtn from '../../../common/IconBtn'

export default function CourseTypeManager() {
  const { token } = useSelector((state) => state.auth)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setLoading(true)
    const result = await getAllCourses(token)
    if (result) {
      setCourses(result)
    }
    setLoading(false)
  }

  const handleCourseTypeChange = async (courseId, courseType) => {
    const result = await setCourseType(courseId, courseType, token)
    if (result) {
      // Update the local state with the data returned from backend
      setCourses(courses.map(course => 
        course._id === courseId 
          ? {
              ...course,
              ...result, // Use the updated course data from backend
              courseType: result.courseType,
              price: result.price,
              originalPrice: result.originalPrice,
              adminSetFree: result.adminSetFree
            }
          : course
      ))
    }
  }

  return (
    <div className="text-white">
      <div className="flex flex-col gap-y-4 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
        <h2 className="text-2xl font-bold text-richblack-5">Course Type Management</h2>

        {loading ? (
          <div className="flex h-[calc(100vh-20rem)] items-center justify-center">
            <div className="spinner"></div>
          </div>
        ) : courses.length === 0 ? (
          <p className="flex h-[calc(100vh-20rem)] items-center justify-center text-richblack-5">
            No courses found
          </p>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Course</Th>
                <Th>Instructor</Th>
                <Th>Original Price</Th>
                <Th>Current Price</Th>
                <Th>Current Type</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {courses.map((course) => (
                <Tr key={course._id}>
                  <Td>
                    <div className="flex items-center gap-x-4">
                      <img
                        src={course.thumbnail}
                        alt={course.courseName}
                        className="h-10 w-14 rounded-md object-cover"
                      />
                      <div>
                        <p className="font-medium">{course.courseName}</p>
                        <p className="text-sm text-richblack-300">
                          Created: {formatDate(course.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-x-4">
                      {course.instructor ? (
                        <>
                          <img
                            src={course.instructor.image}
                            alt={course.instructor.firstName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium">
                              {course.instructor.firstName} {course.instructor.lastName}
                            </p>
                            <p className="text-sm text-richblack-300">
                              {course.instructor.email}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div>
                          <p className="font-medium text-yellow-50">No instructor assigned</p>
                        </div>
                      )}
                    </div>
                  </Td>
                  <Td>₹{course.originalPrice}</Td>
                  <Td>
                    <span className={`font-medium ${
                      course.courseType === 'Free' 
                        ? 'text-caribbeangreen-200' 
                        : 'text-yellow-50'
                    }`}>
                      {course.courseType === 'Free' ? 'Free' : `₹${course.price}`}
                    </span>
                  </Td>
                  <Td>
                    <span className={`font-medium ${
                      course.courseType === 'Free' 
                        ? 'text-caribbeangreen-200' 
                        : 'text-yellow-50'
                    }`}>
                      {course.courseType}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex gap-x-2">
                      {course.courseType === 'Paid' ? (
                        <IconBtn
                          text="Make Free"
                          onClick={() => handleCourseTypeChange(course._id, 'Free')}
                          customClasses="bg-caribbeangreen-200"
                        />
                      ) : (
                        <IconBtn
                          text="Make Paid"
                          onClick={() => handleCourseTypeChange(course._id, 'Paid')}
                          customClasses="bg-yellow-50"
                        />
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </div>
    </div>
  )
}
