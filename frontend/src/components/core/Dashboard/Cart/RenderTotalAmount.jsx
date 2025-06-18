import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { FiCreditCard, FiShield, FiZap, FiGift } from "react-icons/fi"
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

  const savings = Math.round(total * 0.3)
  const originalPrice = total + savings

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 sticky top-6">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5"></div>
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <FiCreditCard className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Order Summary
          </h3>
        </div>
        
        <div className="space-y-4">
          {/* Course Count */}
          <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
            <p className="text-slate-300 font-medium">Courses ({cart.length})</p>
            <p className="text-white font-semibold">₹ {originalPrice}</p>
          </div>

          {/* Discount */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FiGift className="w-4 h-4 text-green-400" />
              <p className="text-green-400 font-medium">Special Discount</p>
            </div>
            <p className="text-green-400 font-semibold">-₹ {savings}</p>
          </div>

          {/* Platform Fee */}
          <div className="flex justify-between items-center">
            <p className="text-slate-400">Platform Fee:</p>
            <div className="flex items-center gap-2">
              <span className="text-sm line-through text-slate-500">₹ 99</span>
              <span className="text-sm font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20 animate-pulse">
                FREE
              </span>
            </div>
          </div>

          {/* Divider with gradient */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 px-4 py-1 rounded-full">
                <span className="text-xs text-slate-400">TOTAL</span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
            <p className="text-xl font-bold text-white">Total Amount:</p>
            <div className="text-right">
              <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                ₹ {total}
              </p>
              <p className="text-sm text-green-400 font-medium">
                You save ₹{savings}!
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Buy Button */}
        <button
          onClick={handleBuyCourse}
          className="group relative w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/25 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <div className="relative flex items-center justify-center gap-3">
            <FiCreditCard className="w-5 h-5" />
            <span>Complete Purchase</span>
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </button>

        {/* Payment Methods */}
        <div className="mt-6 p-4 bg-slate-700/20 rounded-xl">
          <p className="text-sm text-slate-400 mb-3">Accepted Payment Methods:</p>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20">
              UPI
            </div>
            <div className="px-3 py-1 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20">
              Cards
            </div>
            <div className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full border border-purple-500/20">
              Wallets
            </div>
          </div>
        </div>

        {/* Enhanced Security Features */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 text-sm text-slate-400 hover:text-slate-300 transition-colors">
            <div className="p-1 bg-green-500/10 rounded">
              <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span>30-Day Money-Back Guarantee</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-slate-400 hover:text-slate-300 transition-colors">
            <div className="p-1 bg-blue-500/10 rounded">
              <FiShield className="w-3 h-3 text-blue-400" />
            </div>
            <span>SSL Encrypted & Secure Payment</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-slate-400 hover:text-slate-300 transition-colors">
            <div className="p-1 bg-purple-500/10 rounded">
              <FiZap className="w-3 h-3 text-purple-400" />
            </div>
            <span>Instant Access After Purchase</span>
          </div>
        </div>

        {/* Promo Code Section */}
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-xl border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-2">
            <FiGift className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">Have a promo code?</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter code"
              className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500/50"
            />
            <button className="px-4 py-2 bg-yellow-500/10 text-yellow-400 text-sm rounded-lg border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
