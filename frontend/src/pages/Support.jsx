import React from "react";
import ImprovedFooter from "../components/common/ImprovedFooter";

const Support = () => {
  return (
    <div className="flex flex-col min-h-screen bg-richblack-900">
      <div className="w-11/12 max-w-maxContent mx-auto py-12 text-richblack-5">
        <h1 className="text-3xl font-bold mb-6">Support</h1>
        
        <div className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">How Can We Help You?</h2>
            <p className="text-richblack-100">
              We're here to support you on your learning journey. Whether you have technical issues, 
              questions about courses, or need assistance with your account, our support team is ready to help.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Contact Information</h2>
            <div className="space-y-3">
              <p className="text-richblack-100">
                <strong>Email:</strong> support@beejaacademy.com
              </p>
              <p className="text-richblack-100">
                <strong>Phone:</strong> +91 9150274222
              </p>
              <p className="text-richblack-100">
                <strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Common Support Topics</h2>
            <ul className="list-disc pl-6 space-y-2 text-richblack-100">
              <li>Account setup and login issues</li>
              <li>Course enrollment and access</li>
              <li>Payment and billing questions</li>
              <li>Technical troubleshooting</li>
              <li>Certificate and completion queries</li>
              <li>Platform navigation assistance</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Response Time</h2>
            <p className="text-richblack-100">
              We aim to respond to all support requests within 24 hours during business days. 
              For urgent technical issues, we strive to provide faster response times.
            </p>
          </section>
        </div>
      </div>
      <ImprovedFooter />
    </div>
  );
};

export default Support;
