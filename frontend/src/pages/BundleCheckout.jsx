import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import { buyCourse } from "../services/operations/studentFeaturesAPI"
import CouponInput from "../components/core/Dashboard/Cart/CouponInput"
import { useDispatch } from "react-redux"
import { FiArrowLeft, FiShoppingCart, FiCheck, FiStar, FiClock, FiUsers } from "react-icons/fi"
import RatingStars from "../components/common/RatingStars"
import { apiConnector } from "../services/apiConnector"
import { courseAccessEndpoints } from "../services/apis"
import toast from "react-hot-toast"

function BundleCheckout() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const [couponDiscount, setCouponDiscount] = useState(0)

  const handleCouponApply = (discountDetails) => {
    const discountAmount = discountDetails.discountAmount;
    setCouponDiscount(discountAmount);
  }

  const selectedCourses = state?.selectedCourses || []

  if (!selectedCourses.length) {
    return (
      <div className="min-h-screen bg-richblack-900 flex items-center justify-center">
        <div className="text-center">
          <FiShoppingCart className="text-6xl text-richblack-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-richblack-5 mb-2">No Courses Selected</h2>
          <p className="text-richblack-300 mb-6">Please select courses to create a bundle</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-yellow-50 text-richblack-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-25 transition-colors"
          >
            Go Back to Catalog
          </button>
        </div>
      </div>
    )
  }

  const getOriginalPrice = () => {
    return selectedCourses.reduce((total, course) => {
      return total + (course.courseType === 'Free' ? 0 : course.price)
    }, 0)
  }

  const getBundleDiscount = () => {
    if (selectedCourses.length >= 3) return 0.15 // 15% discount for 3+ courses
    if (selectedCourses.length >= 2) return 0.10 // 10% discount for 2+ courses
    return 0
  }

  const getFinalPrice = () => {
    const originalPrice = getOriginalPrice()
    const discount = getBundleDiscount()
    return Math.round(originalPrice * (1 - discount))
  }

  const getSavings = () => {
    return getOriginalPrice() - getFinalPrice()
  }

  const isAllFree = selectedCourses.every(course => course.courseType === 'Free')
  const freeCourses = selectedCourses.filter(course => course.courseType === 'Free')
  const paidCourses = selectedCourses.filter(course => course.courseType !== 'Free')

  const handleBuyBundle = async () => {
    const finalPrice = Math.max(0, getFinalPrice() - couponDiscount)
    const courseIds = selectedCourses.map(course => course._id)
    const paidCourseIds = paidCourses.map(course => course._id)
    const freeCourseIds = freeCourses.map(course => course._id)
    
    if (isAllFree) {
      // Scenario 1: All courses are free - request access from admin
      try {
        const response = await apiConnector("POST", 
          courseAccessEndpoints.REQUEST_BUNDLE_ACCESS_API,
          { 
            courseIds: freeCourseIds
          },
          { Authorization: `Bearer ${token}` }
        )
        if (response.data.success) {
          toast.success("Bundle access request sent successfully!")
          navigate('/dashboard/enrolled-courses')
        }
      } catch (error) {
        console.error("Error requesting bundle access:", error)
        toast.error("Failed to send bundle access request")
      }
    } else if (paidCourses.length > 0 && freeCourses.length === 0) {
      // Scenario 2: All courses are paid - check payment requirement
      if (finalPrice !== 0) {
        toast.error("First pay the course amount.")
        return
      }
      // Proceed with payment for all paid courses
      buyCourse(token, paidCourseIds, user, navigate, dispatch)
    } else if (paidCourses.length > 0 && freeCourses.length > 0) {
      // Scenario 3: Mixed bundle (paid + free courses)
      if (finalPrice !== 0) {
        toast.error("First pay the course amount.")
        return
      }
      
      // First, process payment for paid courses
      try {
        const paymentResult = await buyCourse(token, paidCourseIds, user, navigate, dispatch)
        
        // After successful payment, request access for free courses
        if (paymentResult !== false) { // Assuming buyCourse returns false on failure
          try {
            const response = await apiConnector("POST", 
              courseAccessEndpoints.REQUEST_BUNDLE_ACCESS_API,
              { 
                courseIds: freeCourseIds
              },
              { Authorization: `Bearer ${token}` }
            )
            if (response.data.success) {
              toast.success("Payment completed! Free course access request sent to admin.")
            }
          } catch (error) {
            console.error("Error requesting free course access:", error)
            toast.error("Payment successful, but failed to request free course access")
          }
        }
      } catch (error) {
        console.error("Error processing payment:", error)
        toast.error("Failed to process payment")
      }
    }
  }

  return (
    <div className="min-h-screen bg-richblack-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-richblack-300 hover:text-richblack-100 mb-4 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to Course Selection
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <FiShoppingCart className="text-yellow-50 text-3xl" />
            <h1 className="text-4xl font-bold text-richblack-5">Bundle Checkout</h1>
          </div>
          <p className="text-richblack-300 text-lg">
            Complete your purchase and start your learning journey with {selectedCourses.length} courses
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Course List */}
          <div className="xl:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-richblack-800 to-richblack-900 rounded-2xl p-8 border border-richblack-700"
            >
              <h2 className="text-2xl font-bold text-richblack-5 mb-6 flex items-center gap-3">
                <FiCheck className="text-green-400" />
                Selected Courses ({selectedCourses.length})
              </h2>
              
              <div className="space-y-6">
                {selectedCourses.map((course, index) => (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-6 bg-richblack-700/50 p-6 rounded-xl border border-richblack-600 hover:border-richblack-500 transition-colors"
                  >
                    <img 
                      src={course.thumbnail}
                      alt={course.courseName}
                      className="w-40 h-28 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-richblack-5 mb-2 line-clamp-2">
                        {course.courseName}
                      </h3>
                      <p className="text-richblack-300 mb-3">
                        By {course.instructor?.firstName} {course.instructor?.lastName}
                      </p>
                      
                      {/* Course Stats */}
                      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-richblack-400">
                        <div className="flex items-center gap-1">
                          <FiStar className="text-yellow-400" />
                          <span>{course.averageRating?.toFixed(1) || '0.0'}</span>
                          <RatingStars Review_Count={course.averageRating || 0} Star_Size={14} />
                        </div>
                        <div className="flex items-center gap-1">
                          <FiUsers className="w-4 h-4" />
                          <span>{course.studentsEnrolled?.length || 0} students</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {course.courseType === 'Free' ? (
                            <span className="text-2xl font-bold text-caribbeangreen-100">Free</span>
                          ) : (
                            <span className="text-2xl font-bold text-richblack-5">₹{course.price}</span>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            course.courseType === 'Free' 
                              ? 'bg-caribbeangreen-900/30 text-caribbeangreen-100 border border-caribbeangreen-700' 
                              : 'bg-yellow-900/30 text-yellow-100 border border-yellow-700'
                          }`}>
                            {course.courseType || 'Premium'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Payment Summary */}
          <div className="xl:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-richblack-800 to-richblack-900 rounded-2xl p-8 border border-richblack-700 sticky top-8"
            >
              <h2 className="text-2xl font-bold text-richblack-5 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {/* Coupon Input */}
                <CouponInput 
                  totalAmount={getOriginalPrice()} 
                  onCouponApply={handleCouponApply}
                  checkoutType="bundle"
                />

                <div className="flex justify-between text-richblack-300">
                  <span>Total Courses:</span>
                  <span className="font-semibold">{selectedCourses.length}</span>
                </div>
                
                <div className="flex justify-between text-richblack-300">
                  <span>Original Price:</span>
                  <span className="font-semibold">₹{getOriginalPrice()}</span>
                </div>

                {getBundleDiscount() > 0 && (
                  <>
                    <div className="flex justify-between text-green-400">
                      <span className="text-richblack-100">Bundle Discount ({Math.round(getBundleDiscount() * 100)}%):</span>
                      <span className="font-bold text-green-400">-₹{getSavings()}</span>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-600 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-white text-sm font-semibold">
                        <FiCheck className="w-5 h-5 text-green-400" />
                        🎉 You're saving ₹{getSavings()} with this bundle!
                      </div>
                    </div>
                  </>
                )}
                
                <hr className="border-richblack-600" />
                
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Coupon Discount:</span>
                    <span className="font-bold text-green-400">-₹{couponDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between text-xl font-bold text-richblack-5">
                  <span>Total Amount:</span>
                  <span className="text-yellow-50">₹{Math.max(0, getFinalPrice() - couponDiscount)}</span>
                </div>
              </div>

              <div className="space-y-4">
              <button
                onClick={handleBuyBundle}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3
                  ${isAllFree 
                    ? 'bg-caribbeangreen-200 hover:bg-caribbeangreen-100 text-richblack-900' 
                    : 'bg-gradient-to-r from-yellow-50 to-yellow-25 hover:from-yellow-25 hover:to-yellow-50 text-richblack-900'
                  }`}
              >
                {isAllFree ? (
                  <>
                    <FiCheck className="w-5 h-5" />
                    Request Access
                  </>
                ) : (
                  <>
                    <FiShoppingCart className="w-5 h-5" />
                    Complete Purchase
                  </>
                )}
              </button>

                <button
                  onClick={() => navigate(-1)}
                  className="w-full bg-richblack-700 text-richblack-50 py-3 rounded-xl font-semibold hover:bg-richblack-600 transition-colors border border-richblack-600"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Security/Info Badge */}
              <div className="mt-6 p-4 bg-richblack-700/30 rounded-lg border border-richblack-600">
                <div className="flex items-center gap-2 text-richblack-300 text-sm">
                  <FiCheck className="text-green-400 w-4 h-4" />
                  {isAllFree ? (
                    <span>Your request will be reviewed by admin</span>
                  ) : (
                    <>
                      <span>Secure payment powered by Razorpay</span>
                      {freeCourses.length > 0 && (
                        <div className="mt-2 text-xs text-yellow-100">
                          Note: Free course access will be requested after payment completion
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BundleCheckout
