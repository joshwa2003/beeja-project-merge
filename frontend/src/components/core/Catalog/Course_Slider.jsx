import React from "react"
import Course_Card from "./Course_Card"

function Course_Slider({ Courses }) {
  return (
    <>
      {Courses?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 pt-6 sm:pt-8">
          {Courses?.map((course, i) => (
            <Course_Card 
              key={i} 
              course={course} 
              Height={"h-[200px] sm:h-[220px] lg:h-[250px]"} 
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 pt-6 sm:pt-8">
          {/* Skeleton Loading */}
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-richblack-700 rounded-xl overflow-hidden">
                <div className="h-[200px] sm:h-[220px] lg:h-[250px] bg-richblack-600"></div>
                <div className="p-3 sm:p-4 space-y-3">
                  <div className="h-4 bg-richblack-600 rounded w-3/4"></div>
                  <div className="h-3 bg-richblack-600 rounded w-1/2"></div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 bg-richblack-600 rounded w-8"></div>
                    <div className="h-3 bg-richblack-600 rounded w-16"></div>
                    <div className="h-3 bg-richblack-600 rounded w-12"></div>
                  </div>
                  <div className="h-4 bg-richblack-600 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default Course_Slider
