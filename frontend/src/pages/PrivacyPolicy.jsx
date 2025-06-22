import React from "react";
import ImprovedFooter from "../components/common/ImprovedFooter";

const PrivacyPolicy = () => {
  return (
    <div className="flex flex-col min-h-screen bg-richblack-900">
      <div className="w-11/12 max-w-maxContent mx-auto py-12 text-richblack-5">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="space-y-6">
          <section className="space-y-4">
            <p className="text-richblack-100">
              We understand the importance of safeguarding your personal information and we have formulated 
              a Privacy Policy, to ensure that your personal information is sufficiently protected.
            </p>
          </section>

          <section className="space-y-4">
            <p className="text-richblack-100">
              This Privacy Policy outlines Beeja's approach to Data Protection and Privacy to fulfill its 
              obligations under the applicable laws and regulations. This Privacy Policy applies to your 
              Personal Data which is processed by us, whether in physical or electronic mode.
            </p>
          </section>

          <section className="space-y-4">
            <p className="text-richblack-100">
              We are committed to treating data privacy seriously. It is important that you know exactly 
              what we do with your Personal Data.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Information We Collect</h2>
            <p className="text-richblack-100">
              We collect information that you provide directly to us, including when you:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-richblack-100">
              <li>Create an account or profile</li>
              <li>Enroll in courses</li>
              <li>Participate in discussions or interact with other users</li>
              <li>Contact our support team</li>
              <li>Subscribe to our newsletters</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">How We Use Your Information</h2>
            <p className="text-richblack-100">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-richblack-100">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions and send related information</li>
              <li>Send you technical notices, updates, and security alerts</li>
              <li>Respond to your comments and questions</li>
              <li>Personalize your learning experience</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Data Security</h2>
            <p className="text-richblack-100">
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. However, no method of 
              transmission over the Internet or electronic storage is 100% secure, and we cannot 
              guarantee absolute security.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Updates to This Policy</h2>
            <p className="text-richblack-100">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the effective date at the 
              top of this Privacy Policy.
            </p>
          </section>
        </div>
      </div>
      <ImprovedFooter />
    </div>
  );
};

export default PrivacyPolicy;
