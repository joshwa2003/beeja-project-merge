import React, { useEffect, useRef, useState } from 'react';
import { Link } from "react-router-dom";
import { useDispatch } from 'react-redux';

import "./css style/home.css"

import HighlightText from '../components/core/HomePage/HighlightText';
import CTAButton from "../components/core/HomePage/Button";
import CodeBlocks from "../components/core/HomePage/CodeBlocks";
import TimelineSection from '../components/core/HomePage/TimelineSection';
import LearningLanguageSection from '../components/core/HomePage/LearningLanguageSection';
import InstructorSection from '../components/core/HomePage/InstructorSection';
import ImprovedFooter from '../components/common/ImprovedFooter';
import ExploreMore from '../components/core/HomePage/ExploreMore';
import ReviewSlider from '../components/common/ReviewSlider';
import Course_Slider from '../components/core/Catalog/Course_Slider'

import TeamSlider from '../components/core/HomePage/TeamSlider';
import SplitScreen from '../components/core/HomePage/SplitScreen';

import { getCatalogPageData } from '../services/operations/pageAndComponentData';

import { MdOutlineRateReview } from 'react-icons/md';
import { FaArrowRight } from "react-icons/fa";

import { motion } from 'framer-motion';
import { fadeIn, scaleUp, bounce } from './../components/common/motionFrameVarients';

import BackgroundEffect from './BackgroundEffect';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons';




const Home = () => {
  const [CatalogPageData, setCatalogPageData] = useState(null);
  const [categoryID, setCategoryID] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCatalogPageData = async () => {
      if (!categoryID) return;
      setLoading(true);
      setError(null);
      try {
        const result = await getCatalogPageData(categoryID, dispatch);
        console.log("CatalogPageData API result:", result);
        setCatalogPageData(result);
      } catch (err) {
        console.error("Error fetching catalog page data:", err);
        setError("Failed to fetch catalog page data");
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogPageData();
  }, [categoryID, dispatch]);

  const getUniqueCourseSections = () => {
    if (!CatalogPageData) return { popularPicks: [], topEnrollments: [], additionalCourses: [] };

    const allCourses = [
      ...(CatalogPageData?.selectedCategory?.courses?.filter(course => course.isVisible) || []),
      ...(CatalogPageData?.mostSellingCourses?.filter(course => course.isVisible) || []),
      ...(CatalogPageData?.differentCategory?.courses?.filter(course => course.isVisible) || [])
    ];

    const uniqueCourses = allCourses.filter((course, index, self) =>
      index === self.findIndex(c => c._id === course._id)
    );

    const popularPicks = uniqueCourses.slice(0, 3);
    const topEnrollments = uniqueCourses.slice(3, 6);
    const additionalCourses = uniqueCourses.slice(6, 9);

    return { popularPicks, topEnrollments, additionalCourses };
  };

  const { popularPicks, topEnrollments, additionalCourses } = getUniqueCourseSections();



  // increment count js code

  // let valueDisplay = document.querySelector(".count-num"),
  //     interval = 1000;

  // function value() {
  //     let startValue = 0,
  //         endValue = valueDisplay.getAttribute("data-value"),
  //         duration = Math.floor(interval / endValue);
  //     let counter = setInterval(function () {
  //         startValue += 1;
  //         valueDisplay.textContent = startValue + "+"
  //         if(startValue == endValue){
  //             clearInterval(counter)
  //         }
  //     });
  // }


  const learnerRef1 = useRef(null);
  const learnerRef2 = useRef(null);
  const learnerRef3 = useRef(null);

  const animateCount = (ref) => {
    if (!ref.current) return;
    let count = 0;
    const target = parseInt(ref.current.getAttribute('data-target'));
    const speed = 130; // Adjust speed as needed

    const updateCount = () => {
      const increment = Math.ceil(target / speed);
      count += increment;
      if (count > target) count = target;
      ref.current.innerText = count;
      if (count < target) {
        requestAnimationFrame(updateCount);
      }
    };

    updateCount();
  };

  useEffect(() => {
    animateCount(learnerRef1);
    animateCount(learnerRef2);
    animateCount(learnerRef3);
  }, []);



  return (
    <React.Fragment>
      {/* Background with Gradient and Particles */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-0"
      >
        <BackgroundEffect />
      </motion.div>

      {/* Main Content above background */}
      <div className="relative z-10">
        {/* Section 1 */}
        <div id='home-welcome' className='relative h-[600px] md:h-[400px] justify-center mx-auto flex flex-col w-11/12 max-w-maxContent items-center text-white'>

          <motion.div
            variants={fadeIn('left', 0.1)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.1 }}
            className='text-center text-3xl lg:text-4xl font-semibold mt-7'
          >
            Welcome to
            <HighlightText text={"Beeja "} />
            Igniting Minds, Transforming Futures
          </motion.div>

          <motion.div
            variants={fadeIn('right', 0.1)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.1 }}
            className='mt-4 w-[90%] text-center text-base lg:text-lg font-bold text-richblack-200'
          >
            Embark on a seamless learning experienced with our state of the art platform. Dive into courses crafted to inspire, challenge, and empower you for success.
          </motion.div>

          <motion.div
            variants={fadeIn('up', 0.3)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            className='flex flex-row gap-7 mt-8'
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CTAButton active={true} linkto={"/signup"}>
                Get Started
              </CTAButton>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CTAButton active={false} linkto={"/login"}>
                Learn More <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
              </CTAButton>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          variants={fadeIn('up', 0.2)}
          initial='hidden'
          whileInView={'show'}
          viewport={{ once: false, amount: 0.2 }}
          className='parent-count-container'
        >
          <motion.div
            variants={scaleUp}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            className='count-container'
          >
            <div className="increase-count">
              <i>
                <FontAwesomeIcon icon={faGraduationCap} />
              </i>
              <div className='num'>
                <div ref={learnerRef1} className="count-num" data-target="25">0</div>
                <div className="count-num">K+</div>
              </div>
              <div className='text'>Active Learners</div>
            </div>
          </motion.div>

          <motion.div
            variants={scaleUp}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: 0.2 }}
            className='count-container'
          >
            <div className="increase-count">
              <i>
                <FontAwesomeIcon icon={faGraduationCap} />
              </i>
              <div className='num'>
                <div ref={learnerRef3} className="count-num" data-target="100">0</div>
                <div className="count-num">+</div>
              </div>
              <div className='text'>Total Courses</div>
            </div>
          </motion.div>

          <motion.div
            variants={scaleUp}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: 0.4 }}
            className='count-container'
          >
            <div className="increase-count">
              <i>
                <FontAwesomeIcon icon={faGraduationCap} />
              </i>
              <div className='num'>
                <div ref={learnerRef2} className="count-num" data-target="1200">0</div>
                <div className="count-num">+</div>
              </div>
              <div className='text'>Total Students</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Code Blocks */}
        <div className='relative mx-auto flex flex-col w-11/12 max-w-maxContent items-center text-white justify-between'>
          <motion.div
            variants={fadeIn('up', 0.2)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
          >
            <CodeBlocks
              position={"lg:flex-row"}
              heading={<div className='text-3xl lg:text-4xl font-semibold'>Master Coding with <HighlightText text={"Beeja's Expert-Led "} /> courses</div>}
              subheading={"Elevate your programming skills with Beeja, where hands-on learning meets expert guidance to unlock your full coding potential."}
              ctabtn1={{ btnText: "try it yourself", linkto: "/signup", active: true }}
              ctabtn2={{
                btnText: (
                  <>
                    Learn More <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="ml-2" />
                  </>
                ),
                link: "/signup",
                active: false
              }}

              codeblock={`<<!DOCTYPE html>\n<html>\n<head><title>Example</title>\n</head>\n<body>\n<h1><ahref="/">Header</a>\n</h1>\n<nav><ahref="one/">One</a><ahref="two/">Two</a><ahref="three/">Three</a>\n</nav>`}
              codeColor={"text-yellow-25"}
              backgroundGradient={"code-block1-grad"}
            />
          </motion.div>

          <motion.div
            variants={fadeIn('up', 0.3)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
          >
            <CodeBlocks
              position={"lg:flex-row-reverse"}
              heading={<div className="w-[100%] text-3xl lg:text-4xl font-semibold lg:w-[50%]">Code Instantly  <HighlightText text={"with Beeja"} /></div>}
              subheading={"Jump right into coding at Beeja, where our interactive lessons get you building real-world projects from the very start."}
              ctabtn1={{ btnText: "Continue Lesson", link: "/signup", active: true }}
              ctabtn2={{ btnText: "Learn More", link: "/signup", active: false }}
              codeColor={"text-white"}
              codeblock={`import React from \"react\";\n import CTAButton from \"./Button\";\nimport TypeAnimation from \"react-type\";\nimport { FaArrowRight } from \"react-icons/fa\";\n\nconst Home = () => {\nreturn (\n<div>Home</div>\n)\n}\nexport default Home;`}
              backgroundGradient={"code-block2-grad"}
            />
          </motion.div>

          {/* Team Slider Section */}
          <motion.div
            variants={fadeIn('up', 0.1)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.1 }}
            className='text-center text-3xl lg:text-4xl font-semibold mt-16 mb-8'
          >
            Meet Our Expert
            <HighlightText text={" Team"} />
          </motion.div>
          <motion.div
            variants={scaleUp}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
          >
            <TeamSlider />
          </motion.div>

          <div className="w-full py-20">
            {/* Section Header */}
            <motion.div
              variants={fadeIn('up', 0.1)}
              initial='hidden'
              whileInView={'show'}
              viewport={{ once: false, amount: 0.1 }}
              className='text-center mb-12'
            >
              <h2 className='text-3xl lg:text-4xl font-semibold text-white mb-4'>
                Our Technology
                <HighlightText text={" Partner"} />
              </h2>
            </motion.div>

            {/* Split Screen Section */}
            <SplitScreen />
          </div>


          {/* Popular Picks */}
          <motion.div
            variants={fadeIn('up', 0.2)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            className="mx-auto box-content w-full max-w-maxContentTab px- py-12 lg:max-w-maxContent"
          >
            <motion.h2
              variants={fadeIn('right', 0.3)}
              initial='hidden'
              whileInView={'show'}
              viewport={{ once: false, amount: 0.2 }}
              className="text-white mb-6 text-2xl"
            >
              Popular Picks for You 🏆
            </motion.h2>
            {loading ? (
              <p className="text-white">Loading popular picks...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <motion.div
                variants={scaleUp}
                initial='hidden'
                whileInView={'show'}
                viewport={{ once: false, amount: 0.2 }}
              >
                <Course_Slider Courses={popularPicks} />
              </motion.div>
            )}
          </motion.div>

          {/* Top Enrollments */}
          <motion.div
            variants={fadeIn('up', 0.2)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            className="mx-auto box-content w-full max-w-maxContentTab px- py-12 lg:max-w-maxContent"
          >
            <motion.h2
              variants={fadeIn('right', 0.3)}
              initial='hidden'
              whileInView={'show'}
              viewport={{ once: false, amount: 0.2 }}
              className="text-white mb-6 text-2xl"
            >
              Top Enrollments Today 🔥
            </motion.h2>
            {loading ? (
              <p className="text-white">Loading top enrollments...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <motion.div
                variants={scaleUp}
                initial='hidden'
                whileInView={'show'}
                viewport={{ once: false, amount: 0.2 }}
              >
                <Course_Slider Courses={topEnrollments} />
              </motion.div>
            )}
          </motion.div>



          <motion.div
            variants={fadeIn('up', 0.2)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
          >
            <ExploreMore />
          </motion.div>
        </div>

        {/* Section 2 */}
        <div className='bg-pure-greys-5 text-richblack-700'>
          <div className='homepage_bg h-[310px]'>
            <div className='w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-5 mx-auto'>
              <div className='h-[150px]'></div>
              <motion.div
                variants={fadeIn('up', 0.2)}
                initial='hidden'
                whileInView={'show'}
                viewport={{ once: false, amount: 0.2 }}
                className='flex flex-row gap-7 text-white'
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CTAButton active={true} linkto={"/signup"}>
                    <div className='flex items-center gap-3'>
                      Explore Full Catalog <FaArrowRight />
                    </div>
                  </CTAButton>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CTAButton active={false} linkto={"/signup"}>
                    <div>Learn more <FontAwesomeIcon icon={faArrowUpRightFromSquare} /></div>
                  </CTAButton>
                </motion.div>
              </motion.div>
            </div>
          </div>

          <div className='mx-auto w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-7'>
            <div className='flex flex-col lg:flex-row gap-5 mb-10 mt-[95px]'>
              <motion.div
                variants={fadeIn('right', 0.2)}
                initial='hidden'
                whileInView={'show'}
                viewport={{ once: false, amount: 0.2 }}
                className='text-3xl lg:text-4xl font-semibold w-full lg:w-[45%]'
              >
                Get the Skills you need for a <HighlightText text={"Job that is in demand"} />
              </motion.div>

              <motion.div
                variants={fadeIn('left', 0.2)}
                initial='hidden'
                whileInView={'show'}
                viewport={{ once: false, amount: 0.2 }}
                className='flex flex-col gap-10 w-full lg:w-[40%] items-start'
              >
                <div className='text-[16px]'>
                  The modern StudyNotion dictates its own terms. Today, to be a competitive specialist requires more than professional skills.
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CTAButton active={true} linkto={"/signup"}>
                    <div>Learn more <FontAwesomeIcon icon={faArrowUpRightFromSquare} /></div>
                  </CTAButton>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              variants={fadeIn('up', 0.2)}
              initial='hidden'
              whileInView={'show'}
              viewport={{ once: false, amount: 0.2 }}
            >
              <TimelineSection />
            </motion.div>

            <motion.div
              variants={fadeIn('up', 0.2)}
              initial='hidden'
              whileInView={'show'}
              viewport={{ once: false, amount: 0.2 }}
            >
              <LearningLanguageSection />
            </motion.div>
          </div>
        </div>

        {/* Section 3 */}
        <div className='mt-14 w-11/12 mx-auto max-w-maxContent flex-col items-center justify-between gap-8 bg-richblack-900 text-white'>
          <motion.div
            variants={fadeIn('up', 0.2)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
          >
            <InstructorSection />
          </motion.div>

          <motion.h1
            variants={fadeIn('up', 0.2)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
            className="text-center text-3xl lg:text-4xl font-semibold mt-8 flex justify-center items-center gap-x-3"
          >
            Reviews from other learners
            <motion.span
              variants={bounce}
              initial='hidden'
              whileInView={'show'}
              viewport={{ once: false, amount: 0.2 }}
            >
              <MdOutlineRateReview className='text-yellow-25' />
            </motion.span>
          </motion.h1>

          <motion.div
            variants={fadeIn('up', 0.3)}
            initial='hidden'
            whileInView={'show'}
            viewport={{ once: false, amount: 0.2 }}
          >
            <ReviewSlider />
          </motion.div>
        </div>

        {/* Footer */}
        <ImprovedFooter />
      </div>
    </React.Fragment>
  );
};

export default Home;
