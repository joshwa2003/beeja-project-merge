import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function CourseCard({ course }) {
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();

  return (
    <div className="bg-richblack-800 rounded-lg overflow-hidden hover:scale-[1.03] transition-all duration-200">
      <div className="relative aspect-video">
        <img
          src={course?.thumbnail}
          alt={course?.courseName}
          className="w-full h-full object-cover"
        />
        {course?.courseType === 'Free' && (
          <div className="absolute top-2 right-2 bg-yellow-50 text-richblack-900 px-2 py-1 rounded text-sm font-medium">
            Free
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-richblack-5 mb-2">
          {course?.courseName}
        </h3>
        
        <p className="text-sm text-richblack-300 mb-4 line-clamp-2">
          {course?.courseDescription}
        </p>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-richblack-50">
              By {course?.instructor?.firstName} {course?.instructor?.lastName}
            </p>
            {course?.courseType === 'Free' ? (
              <p className="text-sm text-caribbeangreen-100">Free</p>
            ) : (
              <p className="text-sm text-yellow-50">₹{course?.price}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
