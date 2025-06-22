import React, { useState } from 'react'
import HighlightText from '../HomePage/HighlightText'
import { motion } from 'framer-motion'
import { fadeIn } from '../../common/motionFrameVarients'

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(null)

  const faqData = [
    {
      question: "How does Beeja ensure the quality of its courses?",
      answer: "At Beeja, course quality is our priority. We collaborate with industry experts to design and update our curriculum, ensuring it aligns with the latest trends and standards. Our rigorous review process includes user feedback and continuous assessments. Rest assured, our commitment to providing high-quality, relevant content ensures an enriching learning experience for our users, preparing them for success in their chosen fields."
    },
    {
      question: "How does Beeja stand out from other online learning platforms?",
      answer: "Beeja distinguishes itself through a combination of diverse, expert-curated content and an interactive learning environment. Our courses are crafted by industry professionals, ensuring real-world relevance. We prioritize user engagement with interactive elements, fostering a dynamic and effective learning experience. Additionally, personalized learning paths cater to individual needs."
    },
    {
      question: "What types of learning formats does Beeja offer?",
      answer: "Beeja offers a diverse range of learning formats including video lectures, interactive assignments, live sessions, hands-on projects, and peer collaboration opportunities. Our platform supports both self-paced learning and structured courses, complemented by practical exercises and real-world case studies to ensure comprehensive skill development."
    },
    {
      question: "How does Beeja ensure the accessibility of its courses for learners with different schedules?",
      answer: "We understand the importance of flexibility in learning. Our platform offers 24/7 access to course materials, allowing learners to study at their own pace. Content is available on multiple devices, and courses are structured in digestible modules. We also provide downloadable resources and mobile-friendly content for learning on-the-go."
    },
    {
      question: "Can I get a refund if I'm unsatisfied with a course on Beeja?",
      answer: "Yes, we offer a satisfaction guarantee. If you're unsatisfied with your course, you can request a refund within the first 7 days of purchase. Our support team will guide you through the refund process and gather feedback to help us improve our offerings. Terms and conditions apply to specific courses and circumstances."
    }
  ]

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <section className="mx-auto w-11/12 max-w-maxContent py-12 text-white">
      <motion.div
        variants={fadeIn('up', 0.1)}
        initial='hidden'
        whileInView={'show'}
        viewport={{ once: false, amount: 0.1 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-semibold">
          Frequently Asked <HighlightText text="Questions" />
        </h2>
        <p className="text-richblack-300 mt-3">
          Find answers to common questions about our platform and courses
        </p>
      </motion.div>

      <div className="mt-8 space-y-4 max-w-[800px] mx-auto">
        {faqData.map((faq, index) => (
          <motion.div
            key={index}
            variants={fadeIn('up', 0.1 * (index + 1))}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.1 }}
            className="border border-richblack-600 rounded-lg overflow-hidden bg-richblack-800"
          >
            <button
              className="w-full px-6 py-4 text-left hover:bg-richblack-700 transition-all duration-300 flex justify-between items-center"
              onClick={() => toggleAccordion(index)}
            >
              <span className="text-lg font-medium text-richblack-5">{faq.question}</span>
              <span 
                className={`transform transition-transform duration-300 text-xl text-richblack-5
                  ${activeIndex === index ? 'rotate-180' : ''}`}
              >
                ▼
              </span>
            </button>
            
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden
                ${activeIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <p className="p-6 text-richblack-300 text-base leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default FAQSection
