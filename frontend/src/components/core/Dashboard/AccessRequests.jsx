import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getUserAccessRequests } from '../../../services/operations/courseAccessAPI'
import { getRelativeTime } from '../../../utils/dateFormatter'
import { Link } from 'react-router-dom'

export default function AccessRequests() {
  const { token } = useSelector((state) => state.auth)
  const [requests, setRequests] = useState([])
  const [filteredRequests, setFilteredRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    fetchRequests()
  }, [])

  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredRequests(requests)
    } else {
      setFilteredRequests(requests.filter(request => request.status === statusFilter))
    }
  }, [statusFilter, requests])

  const fetchRequests = async () => {
    setLoading(true)
    const result = await getUserAccessRequests(token)
    if (result) {
      setRequests(result)
    }
    setLoading(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-200 text-richblack-900'
      case 'Approved':
        return 'bg-caribbeangreen-200 text-richblack-900'
      case 'Rejected':
        return 'bg-pink-200 text-richblack-900'
      default:
        return 'bg-richblack-700 text-richblack-50'
    }
  }

  return (
    <div className="text-white">
      <div className="flex flex-col gap-y-4 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-richblack-5">Course Access Requests</h2>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-richblack-700 text-richblack-50 px-4 py-2 rounded-md border border-richblack-600"
          >
            <option value="All">All Requests</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="flex h-[calc(100vh-20rem)] items-center justify-center">
            <div className="spinner"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-y-4 py-12">
            <p className="text-lg text-richblack-5">No access requests found</p>
            <Link
              to="/free-courses"
              className="rounded-md bg-yellow-50 px-4 py-2 text-sm font-medium text-richblack-900 hover:bg-yellow-100 transition-colors"
            >
              Browse Free Courses
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredRequests.map((request) => (
              <div
                key={request._id}
                className="flex flex-col gap-y-4 rounded-md border border-richblack-700 bg-richblack-700 p-4"
              >
                {/* Course Info */}
                <div className="flex gap-x-4">
                  <img
                    src={request.course.thumbnail}
                    alt={request.course.courseName}
                    className="h-20 w-32 rounded-md object-cover"
                  />
                  <div className="flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-richblack-5">
                        {request.course.courseName}
                      </h3>
                      <p className="text-sm text-richblack-300">
                        Requested {getRelativeTime(request.requestDate)}
                      </p>
                    </div>
                    <span className={`self-start rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                </div>

                {/* Request Details */}
                {request.requestMessage && (
                  <div className="border-t border-richblack-600 pt-3">
                    <p className="text-sm text-richblack-300">Your message:</p>
                    <p className="mt-1 text-sm text-richblack-100">{request.requestMessage}</p>
                  </div>
                )}

                {/* Admin Response */}
                {request.adminResponse && (
                  <div className="border-t border-richblack-600 pt-3">
                    <p className="text-sm text-richblack-300">Admin response:</p>
                    <p className="mt-1 text-sm text-richblack-100">{request.adminResponse}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {request.status === 'Approved' && (
                  <Link
                    to={`/view-course/${request.course._id}`}
                    className="mt-2 self-end rounded-md bg-yellow-50 px-4 py-2 text-sm font-medium text-richblack-900 hover:bg-yellow-100 transition-colors"
                  >
                    Start Learning
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
