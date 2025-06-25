import React, { useEffect, useState } from 'react'
import { FaRegEnvelope, FaRegEnvelopeOpen, FaSync } from 'react-icons/fa'
import { MdDelete } from 'react-icons/md'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'

import { apiConnector } from '../../../../services/apiConnector'
import { contactMessageEndpoints } from '../../../../services/apis'
import { formatDate } from '../../../../services/formatDate'

export default function ContactMessages() {
  const { token } = useSelector((state) => state.auth)
  const [messages, setMessages] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchMessages()
    fetchStats()
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await apiConnector(
        'GET',
        contactMessageEndpoints.GET_ALL_MESSAGES_API,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      )
      if (response.data.success) {
        setMessages(response.data.data)
      }
    } catch (error) {
      console.log('Error fetching messages:', error)
      toast.error('Failed to fetch messages')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiConnector(
        'GET',
        contactMessageEndpoints.GET_MESSAGE_STATS_API,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      )
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.log('Error fetching stats:', error)
    }
  }

  const handleMarkAsRead = async (messageId) => {
    try {
      const url = contactMessageEndpoints.MARK_MESSAGE_READ_API.replace(':messageId', messageId);
      console.log('Marking message as read:', { messageId, url });
      
      const response = await apiConnector(
        'PATCH',
        url,
        undefined,
        {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      )
      
      console.log('Mark as read response:', response);
      
      if (response.data.success) {
        toast.success('Message marked as read')
        await fetchMessages()
        await fetchStats()
      } else {
        toast.error(response.data.message || 'Failed to mark message as read')
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else if (error.response?.status === 404) {
        toast.error('Message not found')
      } else if (error.response?.status === 400) {
        toast.error('Invalid request. Please try again.')
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to perform this action')
      } else if (!navigator.onLine) {
        toast.error('No internet connection')
      } else {
        toast.error('Failed to mark message as read. Please try again.')
      }
    }
  }

  const handleDelete = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }
    
    try {
      const url = contactMessageEndpoints.DELETE_MESSAGE_API.replace(':messageId', messageId);
      console.log('Deleting message:', { messageId, url });
      
      const response = await apiConnector(
        'DELETE',
        url,
        undefined,
        {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      )
      
      console.log('Delete response:', response);
      
      if (response.data.success) {
        toast.success('Message deleted successfully')
        await fetchMessages()
        await fetchStats()
      } else {
        toast.error(response.data.message || 'Failed to delete message')
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else if (error.response?.status === 404) {
        toast.error('Message not found')
      } else if (error.response?.status === 400) {
        toast.error('Invalid request. Please try again.')
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to perform this action')
      } else if (!navigator.onLine) {
        toast.error('No internet connection')
      } else {
        toast.error('Failed to delete message. Please try again.')
      }
    }
  }

  const handleRefresh = () => {
    fetchMessages()
    fetchStats()
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="text-white">
      {/* Stats Section with Refresh Button */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Message Statistics</h2>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 rounded-md bg-richblack-700 px-4 py-2 hover:bg-richblack-600"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
        {stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md bg-richblack-700 p-4">
              <h3 className="text-lg font-semibold">Total Messages</h3>
              <p className="mt-2 text-2xl">{stats.total}</p>
            </div>
            <div className="rounded-md bg-richblack-700 p-4">
              <h3 className="text-lg font-semibold">Unread Messages</h3>
              <p className="mt-2 text-2xl">{stats.unread}</p>
            </div>
            <div className="rounded-md bg-richblack-700 p-4">
              <h3 className="text-lg font-semibold">Read Messages</h3>
              <p className="mt-2 text-2xl">{stats.read}</p>
            </div>
            <div className="rounded-md bg-richblack-700 p-4">
              <h3 className="text-lg font-semibold">Last 30 Days</h3>
              <p className="mt-2 text-2xl">{stats.recent}</p>
            </div>
          </div>
        )}
      </div>

      {/* Messages List */}
      <div className="rounded-md border border-richblack-700">
        <div className="border-b border-richblack-700 bg-richblack-800 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Messages ({messages.length})
            </h3>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-richblack-300">
                <FaSync className="animate-spin" />
                Loading...
              </div>
            )}
          </div>
        </div>
        
        {messages.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-richblack-300">No messages found</p>
          </div>
        ) : (
          <div className="divide-y divide-richblack-700">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`p-6 transition-all duration-200 ${
                  message.status === 'unread'
                    ? 'bg-richblack-800 border-l-4 border-l-yellow-500'
                    : 'bg-richblack-900'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-semibold">
                        {message.firstname} {message.lastname}
                      </h4>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        message.status === 'unread' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {message.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-richblack-300">
                      {message.email} • {message.phoneNo}
                    </p>
                    <p className="mt-4 text-richblack-100">{message.message}</p>
                    <p className="mt-2 text-sm text-richblack-400">
                      {formatDate(message.createdAt)}
                    </p>
                  </div>
                  <div className="flex space-x-3 ml-4">
                    <button
                      onClick={() => handleMarkAsRead(message._id)}
                      className={`rounded-full p-2 text-lg transition-all duration-200 ${
                        message.status === 'unread'
                          ? 'bg-richblack-700 hover:bg-richblack-600 text-yellow-400'
                          : 'text-richblack-500 cursor-not-allowed'
                      }`}
                      disabled={message.status === 'read'}
                      title={message.status === 'unread' ? 'Mark as read' : 'Already read'}
                    >
                      {message.status === 'unread' ? (
                        <FaRegEnvelope />
                      ) : (
                        <FaRegEnvelopeOpen />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(message._id)}
                      className="rounded-full p-2 text-lg text-pink-500 hover:bg-pink-100 hover:text-pink-600 transition-all duration-200"
                      title="Delete message"
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
