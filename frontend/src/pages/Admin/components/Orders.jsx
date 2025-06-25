import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { FiDownload, FiEye, FiSearch } from 'react-icons/fi'
import { getAllOrders, updateOrderStatus, generateOrdersPDF } from '../../../services/operations/orderAPI'
import OrderViewModal from './OrderViewModal'

export default function Orders() {
  const { token } = useSelector((state) => state.auth)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'purchaseDate', direction: 'desc' })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      const data = await getAllOrders(token)
      if (data) {
        setOrders(data)
      }
      setLoading(false)
    }
    fetchOrders()
  }, [token])

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  // Filter and sort orders
  const filteredAndSortedOrders = orders
    .filter((order) => {
      const searchString = searchQuery.toLowerCase()
      return (
        order.user?.firstName?.toLowerCase().includes(searchString) ||
        order.user?.lastName?.toLowerCase().includes(searchString) ||
        order.user?.email?.toLowerCase().includes(searchString) ||
        order.course?.courseName?.toLowerCase().includes(searchString) ||
        order.transactionId?.toLowerCase().includes(searchString)
      )
    })
    .sort((a, b) => {
      if (sortConfig.key === 'purchaseDate') {
        return sortConfig.direction === 'asc'
          ? new Date(a.purchaseDate) - new Date(b.purchaseDate)
          : new Date(b.purchaseDate) - new Date(a.purchaseDate)
      }
      // Add more sorting logic for other columns if needed
      return 0
    })

  // Handle status toggle
  const handleStatusToggle = async (orderId, newStatus) => {
    const success = await updateOrderStatus(token, orderId, newStatus)
    if (success) {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      )
    }
  }

  // Generate PDF
  const handleGeneratePDF = () => {
    generateOrdersPDF(token)
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-gradient-to-br from-richblack-900 to-richblack-800">
        <div className="text-center">
          <div className="custom-loader mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-richblack-5 mb-2 animate-pulse">Loading Orders...</h2>
          <p className="text-richblack-300 animate-pulse">Please wait while we fetch your data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-richblack-900 via-richblack-800 to-richblack-900 p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="animate-fadeInUp">
          <h1 className="text-4xl font-bold text-richblack-5 bg-gradient-to-r from-yellow-50 to-yellow-200 bg-clip-text text-transparent">
            Orders Management
          </h1>
          <p className="mt-2 text-richblack-300">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center gap-4 animate-fadeInUp animation-delay-200">
          <div className="relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-richblack-400 transition-colors group-focus-within:text-yellow-50" size={20} />
            <input
              type="text"
              placeholder="Search orders, users, courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 rounded-xl bg-richblack-700 border border-richblack-600 px-12 py-3 text-richblack-5 placeholder-richblack-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-50 focus:border-yellow-50 hover:bg-richblack-600 hover:border-richblack-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-richblack-400 hover:text-richblack-200 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={handleGeneratePDF}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-50 to-yellow-100 px-6 py-3 text-richblack-900 font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-50/20 active:scale-95"
          >
            <FiDownload size={20} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-hidden rounded-2xl border border-richblack-600 bg-gradient-to-br from-richblack-800 to-richblack-900 shadow-2xl animate-fadeInUp animation-delay-400">
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-gradient-to-r from-richblack-700 to-richblack-600">
              <tr className="border-b border-richblack-500">
                <th className="p-6 text-left text-sm font-semibold uppercase tracking-wider text-richblack-100">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-50 text-xs font-bold text-richblack-900">#</span>
                    S.No
                  </div>
                </th>
                <th className="p-6 text-left text-sm font-semibold uppercase tracking-wider text-richblack-100">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">👤</span>
                    User Details
                  </div>
                </th>
                <th className="p-6 text-left text-sm font-semibold uppercase tracking-wider text-richblack-100">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">💳</span>
                    Payment Details
                  </div>
                </th>
                <th
                  className="cursor-pointer p-6 text-left text-sm font-semibold uppercase tracking-wider text-richblack-100 transition-all duration-200 hover:text-yellow-50 hover:scale-105"
                  onClick={() => handleSort('purchaseDate')}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">📅</span>
                    Date of Purchase
                    {sortConfig.key === 'purchaseDate' && (
                      <span className="text-yellow-50 animate-bounce">
                        {sortConfig.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="p-6 text-left text-sm font-semibold uppercase tracking-wider text-richblack-100">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400">⚡</span>
                    Status
                  </div>
                </th>
                <th className="p-6 text-left text-sm font-semibold uppercase tracking-wider text-richblack-100">
                  <div className="flex items-center gap-2">
                    <span className="text-pink-400">⚙️</span>
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-richblack-600">
              {filteredAndSortedOrders.map((order, index) => (
                <tr
                  key={order._id}
                  className="group relative text-base font-medium text-richblack-5 transition-all duration-300 hover:bg-gradient-to-r hover:from-richblack-700 hover:to-richblack-600 hover:shadow-lg animate-slideInLeft"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <td className="p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-yellow-50 to-yellow-100 text-sm font-bold text-richblack-900 shadow-lg transition-transform group-hover:scale-110">
                      {index + 1}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 font-semibold">
                        <span className="text-richblack-300">User:</span> 
                        <span className="text-richblack-5">{order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : 'N/A'}</span>
                      </p>
                      <p className="flex items-center gap-2 text-sm text-richblack-300">
                        <span className="text-richblack-400">Mail ID:</span> 
                        <span className="text-blue-300">{order.user?.email || 'N/A'}</span>
                      </p>
                      <p className="flex items-center gap-2 text-sm text-richblack-300">
                        <span className="text-richblack-400">Course:</span> 
                        <span className="text-green-300">{order.course?.courseName || 'N/A'}</span>
                      </p>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-sm text-richblack-300">
                        <span className="text-richblack-400">ID:</span> 
                        <span className="font-mono text-purple-300">{order.transactionId}</span>
                      </p>
                      <p className="flex items-center gap-2 text-sm text-richblack-300">
                        <span className="text-richblack-400">Payment Method:</span> 
                        <span className="rounded-full bg-richblack-600 px-2 py-1 text-xs text-orange-300">{order.paymentMethod}</span>
                      </p>
                      <p className="flex items-center gap-2 text-lg font-bold text-yellow-50">
                        <span className="text-richblack-400 text-sm font-normal">Total Amount:</span> 
                        <span className="text-green-400">₹{order.amount}</span>
                      </p>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="rounded-lg bg-gradient-to-r from-richblack-600 to-richblack-500 px-4 py-3 text-center shadow-inner">
                      <p className="text-sm font-semibold text-richblack-5">
                        {new Date(order.purchaseDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-richblack-300">
                        {new Date(order.purchaseDate).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col items-start gap-2">
                      <button
                        onClick={() => handleStatusToggle(order._id, !order.status)}
                        className={`${
                          order.status 
                            ? 'bg-gradient-to-r from-green-500 to-green-400 shadow-green-500/30' 
                            : 'bg-gradient-to-r from-richblack-600 to-richblack-500 shadow-richblack-600/30'
                        } relative inline-flex h-7 w-12 items-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-50 focus:ring-offset-2 focus:ring-offset-richblack-800`}
                      >
                        <span
                          className={`${
                            order.status ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300`}
                        />
                      </button>
                      <span className={`text-xs font-medium ${order.status ? 'text-green-400' : 'text-richblack-400'}`}>
                        {order.status ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowViewModal(true)
                        }}
                        className="rounded-lg bg-gradient-to-r from-caribbeangreen-600 to-caribbeangreen-500 p-3 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-caribbeangreen-500/30 active:scale-95"
                        title="View Order"
                      >
                        <FiEye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Empty State */}
        {filteredAndSortedOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
            <div className="rounded-full bg-gradient-to-r from-richblack-600 to-richblack-500 p-8 mb-6 shadow-2xl">
              <FiSearch size={48} className="text-richblack-300" />
            </div>
            <h3 className="text-2xl font-bold text-richblack-5 mb-3">No Orders Found</h3>
            <p className="text-richblack-300 text-center max-w-md leading-relaxed">
              {searchQuery 
                ? `No orders match your search for "${searchQuery}". Try adjusting your search terms.` 
                : 'No orders have been placed yet. Orders will appear here once customers make purchases.'
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 rounded-lg bg-yellow-50 px-4 py-2 text-richblack-900 transition-all hover:scale-105"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <OrderViewModal
          order={selectedOrder}
          onClose={() => {
            setShowViewModal(false)
            setSelectedOrder(null)
          }}
        />
      )}
    </div>
  )
}
