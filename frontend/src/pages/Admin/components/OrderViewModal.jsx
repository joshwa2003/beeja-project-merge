import React from 'react'
import { FiX, FiPrinter } from 'react-icons/fi'

export default function OrderViewModal({ order, onClose }) {
  const handlePrint = () => {
    const printContent = document.getElementById('invoice-content')
    const originalContent = document.body.innerHTML
    
    document.body.innerHTML = printContent.innerHTML
    window.print()
    document.body.innerHTML = originalContent
    window.location.reload()
  }

  const generatePDF = async () => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank')
      const invoiceContent = document.getElementById('invoice-content').innerHTML
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - ${order.transactionId}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .invoice-header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #6366f1; }
            .invoice-title { font-size: 28px; font-weight: bold; margin: 20px 0; }
            .invoice-date { color: #666; }
            .invoice-details { display: flex; justify-content: space-between; margin: 30px 0; }
            .from-to { flex: 1; }
            .from-to h3 { margin-bottom: 10px; font-size: 16px; }
            .order-info { margin: 30px 0; }
            .order-info div { margin: 5px 0; }
            .courses-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            .courses-table th, .courses-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .courses-table th { background-color: #f8f9fa; font-weight: bold; }
            .total { text-align: right; font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          ${invoiceContent}
        </body>
        </html>
      `)
      
      printWindow.document.close()
      printWindow.focus()
      
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="w-11/12 max-w-4xl rounded-lg border border-richblack-400 bg-richblack-800 p-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-richblack-700 pb-4">
          <h2 className="text-xl font-semibold text-richblack-5">Order Invoice</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={generatePDF}
              className="flex items-center gap-2 rounded-md bg-yellow-50 px-4 py-2 text-richblack-900 hover:bg-yellow-25"
            >
              <FiPrinter />
              Print
            </button>
            <button
              onClick={onClose}
              className="text-richblack-300 hover:text-richblack-100"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div id="invoice-content" className="mt-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-2xl font-bold text-yellow-50">🎓 Beeja Academy</div>
            </div>
            <h1 className="text-3xl font-bold text-richblack-5 mb-2">INVOICE</h1>
            <p className="text-richblack-300">
              Date: {new Date(order.purchaseDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>

          {/* From/To Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-richblack-5 mb-3">From:</h3>
              <div className="text-richblack-300">
                <p className="font-medium text-richblack-5">DineshKumar</p>
                <p>Address: 9585113955</p>
                <p>Email: dinesh@beejaacademy.com</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-richblack-5 mb-3">To:</h3>
              <div className="text-richblack-300">
                <p className="font-medium text-richblack-5">
                  {`${order.user?.firstName} ${order.user?.lastName}`}
                </p>
                <p>Address: {order.user?.additionalDetails?.contactNumber || 'N/A'}</p>
                <p>Email: {order.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="mb-8 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-richblack-5">Order ID: </span>
                <span className="text-richblack-300">{order._id}</span>
              </div>
              <div>
                <span className="font-medium text-richblack-5">Transaction ID: </span>
                <span className="text-richblack-300">{order.transactionId}</span>
              </div>
              <div>
                <span className="font-medium text-richblack-5">Payment Method: </span>
                <span className="text-richblack-300">{order.paymentMethod}</span>
              </div>
              <div>
                <span className="font-medium text-richblack-5">Currency: </span>
                <span className="text-richblack-300">INR</span>
              </div>
              <div>
                <span className="font-medium text-richblack-5">Payment Status: </span>
                <span className="text-green-400">Received</span>
              </div>
              <div>
                <span className="font-medium text-richblack-5">Enroll On: </span>
                <span className="text-richblack-300">
                  {new Date(order.purchaseDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Courses Table */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-richblack-600">
              <thead>
                <tr className="bg-richblack-700">
                  <th className="border border-richblack-600 p-3 text-left text-richblack-5">
                    Courses
                  </th>
                  <th className="border border-richblack-600 p-3 text-left text-richblack-5">
                    Instructor
                  </th>
                  <th className="border border-richblack-600 p-3 text-left text-richblack-5">
                    Currency
                  </th>
                  <th className="border border-richblack-600 p-3 text-left text-richblack-5">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-richblack-600 p-3 text-richblack-300">
                    {order.course?.courseName}
                  </td>
                  <td className="border border-richblack-600 p-3 text-richblack-300">
                    {order.course?.instructor?.email || 'dinesh@beejaacademy.com'}
                  </td>
                  <td className="border border-richblack-600 p-3 text-richblack-300">
                    ₹
                  </td>
                  <td className="border border-richblack-600 p-3 text-richblack-300">
                    ₹{order.amount}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="text-right">
            <div className="inline-block border-t-2 border-richblack-600 pt-4">
              <p className="text-xl font-bold text-richblack-5">
                Total Amount: ₹{order.amount}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-sm text-richblack-400">
            <p>Thank you for choosing Beeja Academy!</p>
            <p>For any queries, contact us at dinesh@beejaacademy.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
