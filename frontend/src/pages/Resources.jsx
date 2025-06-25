import React from "react";
import ImprovedFooter from "../components/common/ImprovedFooter";

const Resources = () => {
  return (
    <div className="flex flex-col min-h-screen bg-richblack-900">
      <div className="w-11/12 max-w-maxContent mx-auto py-12 text-richblack-5">
        <h1 className="text-3xl font-bold mb-6">Learning Resources</h1>
        
        <div className="space-y-6">
          <section className="space-y-4">
            <p className="text-richblack-100">
              Enhance your learning journey with our comprehensive collection of resources. 
              From study guides to practice exercises, we provide everything you need to succeed.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Study Materials</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-richblack-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-richblack-50 mb-3">📚 Course Notes</h3>
                <p className="text-richblack-300">Comprehensive notes and summaries for all our courses, available for download.</p>
              </div>
              <div className="bg-richblack-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-richblack-50 mb-3">🎯 Practice Exercises</h3>
                <p className="text-richblack-300">Hands-on exercises and coding challenges to reinforce your learning.</p>
              </div>
              <div className="bg-richblack-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-richblack-50 mb-3">📊 Cheat Sheets</h3>
                <p className="text-richblack-300">Quick reference guides for programming languages and frameworks.</p>
              </div>
              <div className="bg-richblack-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-richblack-50 mb-3">🎥 Video Tutorials</h3>
                <p className="text-richblack-300">Step-by-step video guides for complex topics and practical implementations.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Tools & Software</h2>
            <ul className="list-disc pl-6 space-y-2 text-richblack-100">
              <li>Recommended development environments and IDEs</li>
              <li>Essential software and tools for each course track</li>
              <li>Free and open-source alternatives to premium software</li>
              <li>Browser extensions and productivity tools</li>
              <li>Version control and collaboration platforms</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Community Resources</h2>
            <div className="space-y-3">
              <p className="text-richblack-100">
                <strong>Discussion Forums:</strong> Connect with fellow learners and get help with your questions
              </p>
              <p className="text-richblack-100">
                <strong>Study Groups:</strong> Join or create study groups for collaborative learning
              </p>
              <p className="text-richblack-100">
                <strong>Mentorship Program:</strong> Get guidance from experienced professionals in your field
              </p>
              <p className="text-richblack-100">
                <strong>Career Services:</strong> Resume reviews, interview preparation, and job placement assistance
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">External Resources</h2>
            <p className="text-richblack-100">
              We've curated a list of external resources including documentation, tutorials, 
              and industry blogs to supplement your learning experience. These resources are 
              regularly updated to ensure you have access to the latest information and best practices.
            </p>
          </section>
        </div>
      </div>
      <ImprovedFooter />
    </div>
  );
};

export default Resources;
