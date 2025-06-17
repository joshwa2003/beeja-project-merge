import React from "react"
import { Link } from "react-router-dom"

import RatingStars from "../../common/RatingStars"
import Img from './../../common/Img';



function Course_Card({ course, Height }) {
  // Use the averageRating from backend instead of calculating it on frontend
  const avgRating = course?.averageRating || 0
  const totalRatings = course?.totalRatings || 0

  return (
    <div className='hover:scale-[1.03] transition-all duration-200 z-50 '>
      <Link to={`/courses/${course._id}`}>
        <div className="">
          <div className="rounded-lg">
            <Img
              src={course?.thumbnail}
              alt="course thumnail"
              className={`${Height} w-full rounded-xl object-cover `}
            />
          </div>
          <div className="flex flex-col gap-2 px-1 py-3">
            <p className="text-xl text-richblack-5">{course?.courseName}</p>
            <p className="text-sm text-richblack-50">
              {course?.instructor?.firstName} {course?.instructor?.lastName}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-yellow-5">{avgRating}</span>
              <RatingStars Review_Count={avgRating} />
              <span className="text-richblack-400">
                {totalRatings} Ratings
              </span>
            </div>
            <div className="flex items-center gap-2">
              {course?.courseType === 'Free' ? (
                <p className="text-xl text-caribbeangreen-100">Free</p>
              ) : (
                <p className="text-xl text-richblack-5">Rs. {course?.price}</p>
              )}
              {course?.courseType === 'Free' && course?.originalPrice && (
                <span className="text-sm text-richblack-300 line-through">
                  Rs. {course?.originalPrice}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default Course_Card
