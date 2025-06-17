import React from "react"
import Course_Card from "./Course_Card"

function Course_Slider({ Courses }) {
  return (
    <>
      {Courses?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {Courses?.map((course, i) => (
            <Course_Card key={i} course={course} Height={"h-[250px]"} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-6">
          <p className="h-[201px] w-full rounded-xl skeleton"></p>
          <p className="h-[201px] w-full rounded-xl hidden lg:flex skeleton"></p>
          <p className="h-[201px] w-full rounded-xl hidden lg:flex skeleton"></p>
        </div>
      )}
    </>
  )
}

export default Course_Slider
