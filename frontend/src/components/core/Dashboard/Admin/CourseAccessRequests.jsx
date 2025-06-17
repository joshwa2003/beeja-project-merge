import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Table, Thead, Tbody, Tr, Th, Td } from './Table'
import { getAllAccessRequests, handleAccessRequest } from '../../../../services/operations/courseAccessAPI'
import { formatDate } from '../../../../utils/dateFormatter'
import IconBtn from '../../../common/IconBtn'

export default function CourseAccessRequests() {
  const { token } = useSelector((state) => state.auth)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState('Pending')

  useEffect(() => {
    fetchAccessRequests()
  }, [currentPage, selectedStatus])

  const fetchAccessRequests = async () => {
    setLoading(true)
    const result = await getAllAccessRequests(token, selectedStatus, currentPage)
    if (result) {
      setRequests(result.data)
      setTotalPages(result.pagination.totalPages)
    }
    setLoading(false)
  }

  const handleStatusChange = async (requestId, action, adminResponse = '') => {
    try {
      console.log('Handling status change:', { requestId, action, adminResponse, token: !!token });
      const result = await handleAccessRequest(requestId, action, adminResponse, token)
      console.log('Status change result:', result);
      if (result) {
        await fetchAccessRequests()
      }
    } catch (error) {
      console.error('Error handling status change:', error);
    }
  }

  return (
    <div className="text-white">
      <div className="flex flex-col gap-y-4 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-richblack-5">Course Access Requests</h2>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value)
              setCurrentPage(1)
            }}
            className="rounded-md bg-richblack-700 px-3 py-2"
          >
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="flex h-[calc(100vh-20rem)] items-center justify-center">
            <div className="spinner"></div>
          </div>
        ) : requests.length === 0 ? (
          <p className="flex h-[calc(100vh-20rem)] items-center justify-center text-richblack-5">
            No {selectedStatus.toLowerCase()} requests found
          </p>
        ) : (
          <>
            <Table>
              <Thead>
                <Tr>
                  <Th>Student</Th>
                  <Th>Course</Th>
                  <Th>Request Date</Th>
                  <Th>Message</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {requests.map((request) => (
                  <Tr key={request._id}>
                    <Td>
                      <div className="flex items-center gap-x-4">
                        <img
                          src={request.user?.image || '/default-avatar.png'}
                          alt={request.user?.firstName || 'User'}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium">
                            {request.user?.firstName || 'Unknown'} {request.user?.lastName || 'User'}
                          </p>
                          <p className="text-sm text-richblack-300">{request.user?.email || 'No email'}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-x-4">
                        <img
                          src={request.course?.thumbnail || '/default-course.png'}
                          alt={request.course?.courseName || 'Course'}
                          className="h-10 w-14 rounded-md object-cover"
                        />
                        <div>
                          <p className="font-medium">{request.course?.courseName || 'Unknown Course'}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>{formatDate(request.requestDate)}</Td>
                    <Td>
                      <p className="max-w-xs truncate">{request.requestMessage || "No message"}</p>
                    </Td>
                    <Td>
                      {selectedStatus === 'Pending' ? (
                        <div className="flex gap-x-2">
                          <IconBtn
                            text="Approve"
                            onClick={() => handleStatusChange(request._id, 'approve')}
                            customClasses="bg-caribbeangreen-200"
                          />
                          <IconBtn
                            text="Reject"
                            onClick={() => handleStatusChange(request._id, 'reject')}
                            customClasses="bg-pink-200"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-x-2">
                          <p className={`font-medium ${
                            selectedStatus === 'Approved' 
                              ? 'text-caribbeangreen-200' 
                              : 'text-pink-200'
                          }`}>
                            {selectedStatus}
                          </p>
                          {request.adminResponse && (
                            <p className="text-sm text-richblack-300">
                              - {request.adminResponse}
                            </p>
                          )}
                        </div>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-x-4">
                <IconBtn
                  text="Previous"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                <p className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </p>
                <IconBtn
                  text="Next"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
