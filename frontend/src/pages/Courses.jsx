import React from "react";
import ImprovedFooter from "../components/common/ImprovedFooter";

const Courses = () => {
  return (
    <div className="flex flex-col min-h-screen bg-richblack-900">
      <div className="w-11/12 max-w-maxContent mx-auto py-12 text-richblack-5">
        <h1 className="text-3xl font-bold mb-6">Our Courses</h1>
        
        <div className="space-y-6">
          <section className="space-y-4">
            <p className="text-richblack-100">
              Discover our comprehensive range of courses designed to help you master new skills 
              and advance your career. From beginner-friendly introductions to advanced specializations, 
              we have something for everyone.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Course Categories</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-richblack-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-richblack-50 mb-3">Web Development</h3>
                <p className="text-richblack-300">Learn modern web technologies including HTML, CSS, JavaScript, React, and more.</p>
              </div>
              <div className="bg-richblack-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-richblack-50 mb-3">Data Science</h3>
                <p className="text-richblack-300">Master data analysis, machine learning, and statistical modeling techniques.</p>
              </div>
              <div className="bg-richblack-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-richblack-50 mb-3">Mobile Development</h3>
                <p className="text-richblack-300">Build native and cross-platform mobile applications for iOS and Android.</p>
              </div>
              <div className="bg-richblack-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-richblack-50 mb-3">Cloud Computing</h3>
                <p className="text-richblack-300">Learn cloud platforms like AWS, Azure, and Google Cloud Platform.</p>
              </div>
              <div className="bg-richblack-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-richblack-50 mb-3">Cybersecurity</h3>
                <p className="text-richblack-300">Understand security principles and protect digital assets from threats.</p>
              </div>
              <div className="bg-richblack-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-richblack-50 mb-3">DevOps</h3>
                <p className="text-richblack-300">Learn continuous integration, deployment, and infrastructure automation.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Why Choose Our Courses?</h2>
            <ul className="list-disc pl-6 space-y-2 text-richblack-100">
              <li>Industry-relevant curriculum designed by experts</li>
              <li>Hands-on projects and real-world applications</li>
              <li>Flexible learning schedules</li>
              <li>Certificate of completion</li>
              <li>Lifetime access to course materials</li>
              <li>Community support and mentorship</li>
            </ul>
          </section>
        </div>
      </div>
      <ImprovedFooter />
    </div>
  );
};

export default Courses;
