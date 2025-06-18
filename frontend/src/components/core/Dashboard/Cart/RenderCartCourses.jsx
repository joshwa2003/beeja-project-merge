import { FaStar } from "react-icons/fa"
import { RiDeleteBin6Line } from "react-icons/ri"
import ReactStars from "react-rating-stars-component"
import { useDispatch, useSelector } from "react-redux"

import { removeFromCart } from "../../../../slices/cartSlice"
import Img from './../../../common/Img';

export default function RenderCartCourses() {
  const { cart } = useSelector((state) => state.cart)
  const dispatch = useDispatch()


  return (
    <div className="space-y-6">
      {cart.map((course, indx) => (
        <div
          key={course._id}
          className="course-card rounded-xl p-6 transition-all duration-300"
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Course thumbnail */}
            <div className="relative group">
              <Img
                src={course?.thumbnail}
                alt={course?.courseName}
                className="h-[148px] w-full lg:w-[220px] rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-richblack-5 group-hover:text-yellow-50 transition-colors duration-300">
                  {course?.courseName}
                </h3>
                
                <div className="flex items-center gap-2">
                  <span className="stats-card px-3 py-1 rounded-full text-xs font-medium text-richblack-5">
                    {course?.category?.name}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-50 font-semibold">4.5</span>
                    <ReactStars
                      count={5}
                      value={4.5}
                      size={16}
                      edit={false}
                      activeColor="#fbbf24"
                      emptyIcon={<FaStar />}
                      fullIcon={<FaStar />}
                    />
                  </div>
                  <span className="text-richblack-400 text-sm">
                    ({course?.ratingAndReviews?.length || 0} reviews)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200">
                  ₹ {course?.price}
                </div>
                
                <button
                  onClick={() => dispatch(removeFromCart(course._id))}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300"
                >
                  <RiDeleteBin6Line className="text-lg" />
                  <span className="font-medium">Remove</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}