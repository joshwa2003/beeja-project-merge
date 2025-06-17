import React from 'react';
import { motion } from 'framer-motion';
import { fadeIn, scaleUp } from '../../common/motionFrameVarients';
import './SplitScreen.css';

// Using your existing certification images
import Google from "../../../assets/Images/certification img/Google-certificate-img.png";
import IBM from "../../../assets/Images/certification img/ibm-certification-img.png";
import Meta from "../../../assets/Images/certification img/meta-certification-img.png";
import Oracle from "../../../assets/Images/certification img/oracle-certification-img.png";
import Walmart from "../../../assets/Images/certification img/walmart-certification-img.png";
import Sony from "../../../assets/Images/certification img/sony-certificate-img.png";

const logos = [
  { src: Google, alt: "Google" },
  { src: IBM, alt: "IBM" },
  { src: Meta, alt: "Meta" },
  { src: Oracle, alt: "Oracle" },
  { src: Walmart, alt: "Walmart" },
  { src: Sony, alt: "Sony" }
];

const MarqueeColumn = ({ direction = 'up', logos }) => (
  <div className="marquee-column">
    <div className={`vertical-marquee ${direction}`}>
      <div className="marquee-content">
        {[...logos, ...logos, ...logos].map((logo, idx) => (
          <div className="logo-item" key={idx}>
            <img src={logo.src} alt={logo.alt} className="logo" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SplitScreen = () => {
  return (
    
    
    <motion.div 
      variants={fadeIn('up', 0.2)}
      initial='hidden'
      whileInView={'show'}
      viewport={{ once: false, amount: 0.2 }}
      className="split-container"
    >
      {/* Left Side */}
      <motion.div 
        variants={fadeIn('right', 0.3)}
        initial='hidden'
        whileInView={'show'}
        viewport={{ once: false, amount: 0.2 }}
        className="left-side"
      >
        <div className="text-content">
          <h1>Industry-Leading Certifications</h1>
          <p className="subtitle">Learn from the Best in Tech</p>
          <div className="description">
            <p>
              Our courses are certified by leading tech giants like Google, IBM, Meta, and more. 
              Gain globally recognized credentials that validate your skills and boost your career prospects.
              Join thousands of successful graduates who have transformed their careers through our certified programs.
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cta-button"
          >
            Explore Certifications
          </motion.button>
        </div>
      </motion.div>

      {/* Right Side */}
      <motion.div 
        variants={fadeIn('left', 0.3)}
        initial='hidden'
        whileInView={'show'}
        viewport={{ once: false, amount: 0.2 }}
        className="right-side"
      >
        <MarqueeColumn direction="up" logos={[...logos].sort(() => Math.random() - 0.5)} />
        <MarqueeColumn direction="down" logos={[...logos].sort(() => Math.random() - 0.5)} />
        <MarqueeColumn direction="up" logos={[...logos].sort(() => Math.random() - 0.5)} />
      </motion.div>
    </motion.div>
  );
};

export default SplitScreen;
