import React from "react"
import { Link } from "react-router-dom"

import RatingStars from "../../common/RatingStars"
import Img from './../../common/Img';



function Course_Card({ course, Height }) {
  // Use the averageRating from backend instead of calculating it on frontend
  const avgRating = course?.averageRating || 0
  const totalRatings = course?.totalRatings || 0

  return (
    <div className='hover:scale-[1.02] sm:hover:scale-[1.03] transition-all duration-200 z-50 group'>
      <Link to={`/courses/${course._id}`}>
        <div className="bg-richblack-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="relative">
            <Img
              src={course?.thumbnail}
              alt="course thumbnail"
              className={`${Height} w-full object-cover group-hover:scale-105 transition-transform duration-300`}
            />
            {/* Course Type Badge */}
            {course?.courseType === 'Free' && (
              <div className="absolute top-2 left-2 bg-caribbeangreen-200 text-richblack-900 px-2 py-1 rounded-full text-xs font-medium">
                FREE
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:gap-3 p-3 sm:p-4">
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-richblack-5 line-clamp-2 group-hover:text-yellow-50 transition-colors duration-200">
              {course?.courseName}
            </h3>
            <p className="text-xs sm:text-sm text-richblack-50">
              {course?.instructor?.firstName} {course?.instructor?.lastName}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-yellow-5 text-sm font-medium">{avgRating.toFixed(1)}</span>
              <RatingStars Review_Count={avgRating} />
              <span className="text-richblack-400 text-xs sm:text-sm">
                ({totalRatings} {totalRatings === 1 ? 'Rating' : 'Ratings'})
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {course?.courseType === 'Free' ? (
                <div className="flex items-center gap-2">
                  <p className="text-lg sm:text-xl font-bold text-caribbeangreen-100">Free</p>
                  {course?.originalPrice && (
                    <span className="text-sm text-richblack-300 line-through">
                      ₹{course?.originalPrice}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-lg sm:text-xl font-bold text-richblack-5">₹{course?.price}</p>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default Course_Card
