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
      className={`w-[350px] h-[450px] flex flex-col
        ${currentCard === cardData?.heading
          ? "bg-white shadow-lg shadow-yellow-50/50"
          : "bg-richblack-800 hover:shadow-md hover:shadow-richblack-500/20"
        } rounded-xl overflow-hidden transition-all duration-200 cursor-pointer
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
      <div className="relative h-48 overflow-hidden flex-shrink-0 rounded-t-lg">
        {cardData?.thumbnail ? (
          <img 
            src={cardData.thumbnail} 
            alt={cardData.heading}
            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="w-full h-full bg-gradient-to-br from-richblack-700 to-richblack-800 flex items-center justify-center"
          style={{ display: cardData?.thumbnail ? 'none' : 'flex' }}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">📚</div>
            <span className="text-richblack-300 text-sm font-medium">{cardData?.heading}</span>
          </div>
        </div>
        {/* Course Type Badge */}
        <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full font-bold text-xs
          ${cardData?.courseType === "Free" 
            ? "bg-caribbeangreen-200 text-caribbeangreen-800 border border-caribbeangreen-300" 
            : "bg-blue-600/90 text-white"} 
          backdrop-blur-sm shadow-md`}>
          {cardData?.courseType === "Free" ? "FREE" : "PREMIUM"}
        </div>
      </div>

      {/* Content Section - Flexible Height */}
      <div className="p-4 flex flex-col gap-2 flex-grow">
        <h3 className={`font-semibold text-lg leading-tight mb-1
          ${currentCard === cardData?.heading ? "text-richblack-800" : "text-richblack-25"}`}>
          {cardData?.heading}
        </h3>

        <p className="text-richblack-400 text-sm line-clamp-2 mb-4">
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
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-richblack-600">
          {cardData?.rating !== undefined ? (
            <div className="flex items-center gap-1">
              <RatingStars rating={cardData.rating} />
              <span className={`text-sm ${currentCard === cardData?.heading ? "text-richblack-600" : "text-yellow-50"}`}>
                ({cardData.ratingCount || 0})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className={`text-sm ${currentCard === cardData?.heading ? "text-richblack-600" : "text-richblack-400"}`}>
                No ratings yet
              </span>
            </div>
          )}
          
          {/* Price Display */}
          {cardData?.price !== undefined && (
            <div className={`flex items-center font-bold text-lg
              ${currentCard === cardData?.heading ? "text-richblack-800" : "text-yellow-50"}`}>
              {cardData.price === 0 ? (
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-caribbeangreen-300">FREE</span>
                <span className="text-sm text-richblack-400 line-through">₹1999</span>
              </div>
              ) : (
                <>
                  <FaRupeeSign className="text-sm" />
                  <span>{cardData.price.toLocaleString()}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
