import React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { HiUsers } from "react-icons/hi"
import { FaRupeeSign, FaClock } from "react-icons/fa"

import RatingStars from "../../common/RatingStars"
import Img from './../../common/Img';

function Course_Card({ course, Height }) {
  // Use the averageRating from backend instead of calculating it on frontend
  const avgRating = course?.averageRating || 0
  const totalRatings = course?.totalRatings || 0

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className='z-50 group transform hover:-translate-y-1 transition-all duration-300 w-[320px] h-[480px]'
    >
      <Link to={`/courses/${course._id}`}>
        <div className="bg-richblack-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-richblack-500/20 transition-all duration-300 h-full flex flex-col">
          {/* Thumbnail Section - Fixed Height */}
          <div className="relative overflow-hidden h-48 flex-shrink-0">
            {course?.thumbnail ? (
              <Img
                src={course?.thumbnail}
                alt="course thumbnail"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-richblack-700 flex items-center justify-center">
                <span className="text-richblack-400 text-sm">No Image</span>
              </div>
            )}
            {/* Course Type Badge */}
            <div className={`absolute top-3 left-3 px-4 py-2 rounded-full font-bold text-sm 
              ${course?.courseType === 'Free' || course?.adminSetFree
                ? "bg-caribbeangreen-200 text-caribbeangreen-800 border border-caribbeangreen-300" 
                : "bg-blue-600/90 text-white"} 
              backdrop-blur-sm shadow-xl`}>
              {course?.courseType === 'Free' || course?.adminSetFree ? "FREE" : "PREMIUM"}
            </div>
            {course?.adminSetFree && course?.originalPrice && (
              <div className="absolute top-3 right-3 bg-red-500/90 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm shadow-xl">
                SALE
              </div>
            )}
          </div>
          
          {/* Content Section - Flexible Height */}
          <div className="flex flex-col gap-2 sm:gap-3 p-4 sm:p-5 flex-grow">
            <h3 className="text-base sm:text-lg font-semibold text-richblack-5 line-clamp-2 group-hover:text-yellow-50 transition-colors duration-200 leading-tight">
              {course?.courseName}
            </h3>
            
            <p className="text-xs sm:text-sm text-richblack-200">
              By <span className="text-yellow-50 font-medium">
                {course?.instructor?.firstName} {course?.instructor?.lastName}
              </span>
            </p>

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-xs text-richblack-400">
              <div className="flex items-center gap-1">
                <HiUsers className="text-sm" />
                <span>{course?.studentsEnrolled?.length || 0} students</span>
              </div>
              <div className="flex items-center gap-1">
                <FaClock className="text-sm" />
                <span>12 hours</span>
              </div>
            </div>
            
            {/* Rating Row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-yellow-50 text-sm font-medium">{avgRating.toFixed(1)}</span>
              <RatingStars Review_Count={avgRating} />
              <span className="text-richblack-400 text-xs sm:text-sm">
                ({totalRatings} {totalRatings === 1 ? 'Rating' : 'Ratings'})
              </span>
            </div>
            
            {/* Price Row */}
            <div className="flex items-center justify-between pt-2 border-t border-richblack-700">
              <div className="flex items-center gap-2">
                {course?.courseType === 'Free' || course?.adminSetFree ? (
                  <>
                    <span className="text-lg font-bold text-caribbeangreen-300">FREE</span>
                    <span className="text-sm text-richblack-400 line-through">₹1999</span>
                  </>
                ) : (
                  <>
                    {course?.originalPrice && course?.originalPrice !== course?.price && (
                      <span className="text-sm text-richblack-400 line-through">
                        ₹{course.originalPrice}
                      </span>
                    )}
                    <div className="flex items-center text-yellow-50 font-bold">
                      <FaRupeeSign className="text-sm" />
                      <span className="text-lg">{course?.price}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default Course_Card
