import React from "react";
import ImprovedFooter from "../components/common/ImprovedFooter";

const Careers = () => {
  return (
    <div className="flex flex-col min-h-screen bg-richblack-900">
      <div className="w-11/12 max-w-maxContent mx-auto py-12 text-richblack-5">
        <h1 className="text-3xl font-bold mb-6">Careers at Beeja</h1>
        
        <div className="space-y-6">
          <section className="space-y-4">
            <p className="text-richblack-100">
              Join our mission to transform education and empower learners worldwide. 
              We're looking for passionate individuals who want to make a difference in the lives of millions of students.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Why Work With Us?</h2>
            <ul className="list-disc pl-6 space-y-2 text-richblack-100">
              <li>Be part of a mission-driven organization transforming education</li>
              <li>Work with cutting-edge technology and innovative learning platforms</li>
              <li>Collaborate with talented professionals from diverse backgrounds</li>
              <li>Flexible work arrangements and remote-friendly culture</li>
              <li>Competitive compensation and comprehensive benefits</li>
              <li>Continuous learning and professional development opportunities</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Open Positions</h2>
            <div className="space-y-4">
              <div className="bg-richblack-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-richblack-50 mb-2">Software Engineer</h3>
                <p className="text-richblack-300 mb-3">Full-time • Remote • Engineering</p>
                <p className="text-richblack-100">Build scalable web applications and contribute to our learning platform architecture.</p>
              </div>
              <div className="bg-richblack-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-richblack-50 mb-2">Product Manager</h3>
                <p className="text-richblack-300 mb-3">Full-time • Hybrid • Product</p>
                <p className="text-richblack-100">Drive product strategy and work with cross-functional teams to deliver exceptional user experiences.</p>
              </div>
              <div className="bg-richblack-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-richblack-50 mb-2">Content Creator</h3>
                <p className="text-richblack-300 mb-3">Full-time • Remote • Content</p>
                <p className="text-richblack-100">Create engaging educational content and collaborate with subject matter experts.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">How to Apply</h2>
            <p className="text-richblack-100">
              Ready to join our team? Send your resume and a cover letter to 
              <span className="text-yellow-50 font-medium"> careers@beejaacademy.com</span>. 
              We review all applications and will get back to you within 2 weeks.
            </p>
          </section>
        </div>
      </div>
      <ImprovedFooter />
    </div>
  );
};

export default Careers;
