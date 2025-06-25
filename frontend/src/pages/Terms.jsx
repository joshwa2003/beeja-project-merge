import React from "react";
import ImprovedFooter from "../components/common/ImprovedFooter";

const Terms = () => {
  return (
    <div className="flex flex-col min-h-screen bg-richblack-900">
      <div className="w-11/12 max-w-maxContent mx-auto py-12 text-richblack-5">
        <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
        
        <div className="space-y-6">
          <section className="space-y-4">
            <p className="text-richblack-100">
              The following demonstrates terms and conditions of use applicable to your use of beejaacademy.com. 
              It is an agreement between you as the user(s) of the website and Beeja Academy. Before you subscribe 
              to and/or begin participating in or using web site, we believe that you have fully read, understood 
              and accept the agreement.
            </p>
            
            <p className="text-richblack-100">
              You may be accessing our Site from a computer or mobile phone device (through an iOS or Android 
              application) and these Terms of Use govern your use of our Site and your conduct, regardless of 
              the means of access.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Platform Usage</h2>
            <p className="text-richblack-100">
              The Platform is only to be used for your personal use and information. Your use of the services 
              and features of the Platform shall be governed by these Terms and Conditions (hereinafter "Terms 
              of Use") along with the Privacy Policy, Refund and Return Policy. By mere accessing or using the 
              Platform, you are acknowledging, without limitation or qualification, to be bound by these Terms 
              of Use and the Polices, whether you have read the same or not. ACCESSING, BROWSING OR OTHERWISE 
              USING THE PLATFORM INDICATES YOUR UNCONDITIONAL AGREEMENT TO ALL THE TERMS AND CONDITIONS IN THIS 
              AGREEMENT.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Product Information</h2>
            <p className="text-richblack-100">
              Beeja Academy attempts to be as accurate as possible in the description of the product on the 
              Platform. However, we do not warrant that the product description, colour, information or other 
              content of the Platform is accurate, complete, reliable, current or error-free. The Site may 
              contain typographical errors or inaccuracies and may not be complete or current. The product 
              pictures are indicative and may not match the actual product.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Product Use & Services</h2>
            <p className="text-richblack-100">
              The products and services available on the Platform, and the samples, if any, that Platform may 
              provide you, are for your personal and/or professional use only. The products or services, or 
              samples thereof, which you may receive from us, shall not be sold or resold for any/commercial 
              reasons.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">Site Security</h2>
            <p className="text-richblack-100">
              You are prohibited from violating or attempting to violate the security of the Site, including, 
              without limitation:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-richblack-100">
              <li>Accessing data not intended for you or logging onto a server or an account which you are not authorized to access;</li>
              <li>Attempting to probe, scan or test the vulnerability of a system or network or to breach security or authentication measures without proper authorization;</li>
              <li>Attempting to interfere with service to any other user, host or network, including, without limitation, via means of submitting a virus to the Site, overloading, "flooding," "spamming," "mail bombing" or "crashing;"</li>
              <li>Sending unsolicited email, including promotions and/or advertising of products or services;</li>
              <li>Forging any header or any part of the header information in any email or newsgroup posting.</li>
            </ul>
            <p className="text-richblack-100">
              Violations of system or network security may result in civil or criminal liability. Beeja Academy 
              is entitled to investigate occurrences that may involve such violations and may involve, and 
              co-operate with, law enforcement authorities in prosecuting users who are involved in such violations.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-richblack-50">General</h2>
            <p className="text-richblack-100">
              You acknowledge and hereby agree to these Terms and Conditions and that it constitute the complete 
              and exclusive agreement between us concerning your use of the Site, and supersede and govern all 
              prior proposals, agreements, or other communications.
            </p>
            <p className="text-richblack-100">
              We reserve the right, in our sole discretion, to change/alter/modify these Terms and Conditions 
              at any time by posting the changes on the Site. Any changes are effective immediately upon posting 
              to the Site.
            </p>
            <p className="text-richblack-100">
              Nothing contained in these Terms and Conditions shall be construed as creating any agency, 
              partnership, affiliation, joint venture or other form of joint enterprise between us. Our failure 
              to require your performance of any provision hereof shall not affect our full right to require 
              such performance at any time thereafter, nor shall our waiver of a breach of any provision hereof 
              be taken or held to be a waiver of the provision itself.
            </p>
            <p className="text-richblack-100">
              In the event that any provision of these Terms and Conditions shall be unenforceable or invalid 
              under any applicable law or be so held by any applicable arbitral award or court decision, such 
              unenforceability or invalidity shall not render these Terms and Conditions unenforceable or 
              invalid as a whole but these Terms and Conditions shall be modified, to the extent possible, by 
              the adjudicating entity to most fully reflect the original intent of the parties as reflected in 
              the original provision.
            </p>
          </section>
        </div>
      </div>
      <ImprovedFooter />
    </div>
  );
};

export default Terms;
