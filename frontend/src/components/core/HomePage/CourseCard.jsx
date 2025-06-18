import React from "react";
import { motion } from "framer-motion";
import { HiUsers } from "react-icons/hi";
import { ImTree } from "react-icons/im";
import { FaRupeeSign } from "react-icons/fa";
import RatingStars from "../../common/RatingStars";

const CourseCard = ({ cardData, currentCard, setCurrentCard }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={`w-[320px] h-[420px] flex flex-col
        ${currentCard === cardData?.heading
          ? "bg-white shadow-lg shadow-yellow-50/50"
          : "bg-richblack-800 hover:shadow-md hover:shadow-richblack-500/20"
        } rounded-lg overflow-hidden transition-all duration-200 cursor-pointer
        transform hover:-translate-y-1`}
      onClick={() => setCurrentCard(cardData?.heading)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setCurrentCard(cardData?.heading);
        }
      }}
    >
      {/* Thumbnail Section - Fixed Height */}
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        {cardData?.thumbnail ? (
          <img 
            src={cardData.thumbnail} 
            alt={cardData.heading}
            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-richblack-700 flex items-center justify-center">
            <span className="text-richblack-400 text-sm">No Image</span>
          </div>
        )}
        {cardData.courseType === "Free" && (
          <div className="absolute top-2 right-2 bg-yellow-50 text-richblack-900 text-xs font-semibold px-2 py-1 rounded">
            FREE
          </div>
        )}
      </div>

      {/* Content Section - Flexible Height */}
      <div className="p-4 flex flex-col gap-2 flex-grow">
        <h3 className={`font-semibold text-lg leading-tight mb-1
          ${currentCard === cardData?.heading ? "text-richblack-800" : "text-richblack-25"}`}>
          {cardData?.heading}
        </h3>

        <p className="text-richblack-400 text-sm line-clamp-2 mb-2">
          {cardData?.description}
        </p>

        {/* Stats Row */}
        <div className={`flex items-center justify-between text-sm
          ${currentCard === cardData?.heading ? "text-richblack-800" : "text-richblack-400"}`}>
          <div className="flex items-center gap-1">
            <HiUsers className="text-lg" />
            <span>{cardData?.level || "Beginner"}</span>
          </div>
          <div className="flex items-center gap-1">
            <ImTree className="text-lg" />
            <span>{cardData?.lessionNumber || 0} Lessons</span>
          </div>
        </div>

        {/* Rating and Price Row */}
        {(cardData?.rating !== undefined || cardData?.price !== undefined) && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-richblack-700">
            {cardData?.rating !== undefined && (
              <div className="flex items-center gap-1">
                <RatingStars rating={cardData.rating} />
                <span className="text-yellow-50 text-sm">
                  ({cardData.ratingCount || 0})
                </span>
              </div>
            )}
            {cardData?.price !== undefined && (
              <div className={`flex items-center font-semibold
                ${currentCard === cardData?.heading ? "text-richblack-800" : "text-yellow-50"}`}>
                <FaRupeeSign className="text-sm" />
                <span>{cardData.price}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CourseCard;
