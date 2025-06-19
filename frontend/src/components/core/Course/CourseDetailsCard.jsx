import React from "react"
import copy from "copy-to-clipboard"
import { toast } from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { BsFillCaretRightFill } from "react-icons/bs"
import { FaShareSquare } from "react-icons/fa"

import { addToCart } from "../../../slices/cartSlice"
import { ACCOUNT_TYPE } from "../../../utils/constants"
import { requestCourseAccess } from "../../../services/operations/courseAccessAPI"
import RatingStars from "../../common/RatingStars"
import Img from './../../common/Img';


function CourseDetailsCard({ course, setConfirmationModal, handleBuyCourse }) {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    thumbnail: ThumbnailImage,
    price: CurrentPrice,
    _id: courseId,
  } = course

  const handleShare = () => {
    copy(window.location.href)
    toast.success("Link copied to clipboard")
  }

  const handleAddToCart = () => {
    if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("You are an Instructor. You can't buy a course.")
      return
    }
    if (token) {
      dispatch(addToCart(course))
      return
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to add To Cart",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  const handleRequestAccess = async () => {
    if (!user) {
      toast.error("Please login to request access");
      navigate("/login");
      return;
    }

    try {
      const response = await requestCourseAccess({ courseId, requestMessage: "" }, token);
      if (response) {
        toast.success("Access request submitted successfully");
      }
    } catch (error) {
      console.error("Error requesting access:", error);
      toast.error("Failed to submit access request");
    }
  };

  // console.log("Student already enrolled ", course?.studentsEnroled, user?._id)

  return (
    <>
      <div
        className={`flex flex-col gap-4 rounded-2xl bg-richblack-700 p-4 text-richblack-5 `}
      >
        {/* Course Image */}
        <Img
          src={ThumbnailImage}
          alt={course?.courseName}
          className="max-h-[300px] min-h-[180px] w-[400px] overflow-hidden rounded-2xl object-cover md:max-w-full"
        />

        <div className="px-4">
          <div className="pb-4">
            {course?.courseType === 'Free' ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-caribbeangreen-300">FREE</span>
                <span className="text-lg text-richblack-400 line-through">₹1999</span>
                <div className="bg-caribbeangreen-200 text-caribbeangreen-800 px-3 py-1 rounded-full text-sm font-bold">
                  100% OFF
                </div>
              </div>
            ) : (
              <span className="text-3xl font-semibold text-yellow-50">Rs. {CurrentPrice}</span>
            )}
          </div>
          
          {/* Rating Display */}
          {(course?.averageRating > 0 || course?.totalRatings > 0) && (
            <div className="flex items-center gap-2 pb-4">
              <span className="text-yellow-5 text-lg font-medium">
                {course?.averageRating || 0}
              </span>
              <RatingStars Review_Count={course?.averageRating || 0} />
              <span className="text-richblack-300 text-sm">
                ({course?.totalRatings || 0} ratings)
              </span>
            </div>
          )}
          <div className="flex flex-col gap-4">
            {/* Course Type Badge */}
            <div className={`inline-flex px-4 py-2 rounded-full font-bold text-sm mb-4
              ${course?.courseType === 'Free' 
                ? "bg-caribbeangreen-200 text-caribbeangreen-800 border border-caribbeangreen-300" 
                : "bg-blue-600/90 text-white"} 
              backdrop-blur-sm shadow-lg`}>
              {course?.courseType === 'Free' ? "FREE COURSE" : "PREMIUM COURSE"}
            </div>

            {course?.courseType === 'Free' ? (
              <button
                className="w-full bg-caribbeangreen-300 hover:bg-caribbeangreen-400 text-richblack-900 font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg outline-none"
                onClick={
                  user && course?.studentsEnrolled.includes(user?._id)
                    ? () => navigate("/dashboard/enrolled-courses")
                    : handleRequestAccess
                }
              >
                {user && course?.studentsEnrolled.includes(user?._id)
                  ? "Go To Course"
                  : "Get Free Access"}
              </button>
            ) : (
              <>
                <button
                  className="yellowButton outline-none"
                  onClick={
                    user && course?.studentsEnrolled.includes(user?._id)
                      ? () => navigate("/dashboard/enrolled-courses")
                      : handleBuyCourse
                  }
                >
                  {user && course?.studentsEnrolled.includes(user?._id)
                    ? "Go To Course"
                    : "Buy Now"}
                </button>
                {/* Removed Add to Cart button as per user request */}
              </>
            )}
          </div>

          <div className={``}>
            <p className={`my-2 text-xl font-semibold `}>
              Course Requirements :
            </p>
            <div className="flex flex-col gap-3 text-sm text-caribbeangreen-100">
              {course?.instructions?.map((item, i) => {
                return (
                  <p className={`flex gap-2`} key={i}>
                    <BsFillCaretRightFill />
                    <span>{item}</span>
                  </p>
                )
              })}
            </div>
          </div>

          <div className="text-center">
            <button
              className="mx-auto flex items-center gap-2 py-6 text-yellow-100 "
              onClick={handleShare}
            >
              <FaShareSquare size={15} /> Share
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default CourseDetailsCard
