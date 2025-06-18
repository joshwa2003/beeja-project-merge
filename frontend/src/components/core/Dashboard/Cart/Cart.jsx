import { useSelector } from "react-redux"

import RenderCartCourses from "./RenderCartCourses"
import RenderTotalAmount from "./RenderTotalAmount"

export default function Cart() {
  const { total, totalItems } = useSelector((state) => state.cart)

  return (
    <div className="fade-in-up">
      <div className="glass-effect p-6 rounded-xl mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200 text-center sm:text-left">
          Shopping Cart
        </h1>
        <div className="flex items-center justify-between mt-4">
          <p className="text-richblack-200 opacity-75">
            Review your selected courses
          </p>
          <div className="stats-card px-4 py-2 rounded-lg">
            <span className="text-sm font-semibold text-richblack-5">
              {totalItems} {totalItems === 1 ? 'Course' : 'Courses'}
            </span>
          </div>
        </div>
      </div>

      {total > 0 ? (
        <div className="flex flex-col-reverse items-start gap-6 lg:flex-row">
          <div className="flex-1">
            <RenderCartCourses />
          </div>
          <div className="w-full lg:w-80">
            <RenderTotalAmount />
          </div>
        </div>
      ) : (
        <div className="card-gradient rounded-xl p-12 glass-effect text-center">
          <div className="floating-animation">
            <svg className="w-24 h-24 mx-auto text-richblack-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-richblack-5 mb-2">Your cart is empty</h3>
          <p className="text-richblack-300 mb-6">
            Explore our courses and add them to your cart to get started
          </p>
          <button className="yellowButton">
            Browse Courses
          </button>
        </div>
      )}
    </div>
  )
}
