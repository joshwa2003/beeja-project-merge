import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import IconBtn from "../../../common/IconBtn"
import { buyCourse } from "../../../../services/operations/studentFeaturesAPI"

export default function RenderTotalAmount() {
  const { total, cart } = useSelector((state) => state.cart)
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()
  const dispatch = useDispatch()


  const handleBuyCourse = async () => {
    const courses = cart.map((course) => course._id)
    await buyCourse(token, courses, user, navigate, dispatch)
  }

  return (
    <div className="stats-card rounded-xl p-6 glass-effect">
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-richblack-700">
          <p className="text-sm font-medium text-richblack-300">Subtotal:</p>
          <p className="text-lg font-semibold text-richblack-5">₹ {total}</p>
        </div>

        <div className="flex justify-between items-center pb-4 border-b border-richblack-700">
          <p className="text-sm font-medium text-richblack-300">Platform Fee:</p>
          <div className="flex items-center gap-2">
            <span className="text-sm line-through text-richblack-300">₹ 99</span>
            <span className="text-sm font-semibold text-caribbeangreen-100">FREE</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <p className="text-lg font-semibold text-richblack-5">Total:</p>
          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200">
            ₹ {total}
          </p>
        </div>
      </div>

      <button
        onClick={handleBuyCourse}
        className="w-full mt-6 py-3 text-center text-[16px] font-semibold rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-200 text-richblack-900 hover:scale-[1.02] transition-all duration-300"
      >
        <div className="flex items-center justify-center gap-2">
          <span>Buy Now</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </button>

      <p className="mt-4 text-xs text-center text-richblack-300">
        30-Day Money-Back Guarantee
      </p>
    </div>
  )
}