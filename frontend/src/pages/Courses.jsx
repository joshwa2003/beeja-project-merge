import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaCode, FaDatabase, FaMobile, FaCloud, FaShieldAlt, FaCogs, FaSearch, FaFilter, FaStar, FaClock, FaUsers, FaPlay, FaBookmark, FaArrowRight } from "react-icons/fa";
import ImprovedFooter from "../components/common/ImprovedFooter";

const Courses = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  const categories = [
    { id: "all", name: "All Courses", icon: <FaCode />, count: 24 },
    { id: "web-dev", name: "Web Development", icon: <FaCode />, count: 8 },
    { id: "data-science", name: "Data Science", icon: <FaDatabase />, count: 6 },
    { id: "mobile", name: "Mobile Development", icon: <FaMobile />, count: 4 },
    { id: "cloud", name: "Cloud Computing", icon: <FaCloud />, count: 3 },
    { id: "security", name: "Cybersecurity", icon: <FaShieldAlt />, count: 2 },
    { id: "devops", name: "DevOps", icon: <FaCogs />, count: 1 }
  ];

  const courses = [
    {
      id: 1,
      title: "Complete Web Development Bootcamp",
      description: "Master HTML, CSS, JavaScript, React, Node.js, and MongoDB in this comprehensive full-stack course.",
      category: "web-dev",
      level: "Beginner to Advanced",
      duration: "12 weeks",
      students: 15420,
      rating: 4.9,
      price: 299,
      originalPrice: 499,
      instructor: "Sarah Johnson",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop",
      featured: true,
      bestseller: true,
      skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB"]
    },
    {
      id: 2,
      title: "Data Science & Machine Learning",
      description: "Learn Python, pandas, scikit-learn, and TensorFlow to become a data scientist.",
      category: "data-science",
      level: "Intermediate",
      duration: "16 weeks",
      students: 12350,
      rating: 4.8,
      price: 399,
      originalPrice: 599,
      instructor: "Dr. Michael Chen",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
      featured: true,
      bestseller: false,
      skills: ["Python", "Pandas", "Scikit-learn", "TensorFlow", "Statistics"]
    },
    {
      id: 3,
      title: "React Native Mobile Development",
      description: "Build cross-platform mobile apps for iOS and Android using React Native.",
      category: "mobile",
      level: "Intermediate",
      duration: "10 weeks",
      students: 8750,
      rating: 4.7,
      price: 249,
      originalPrice: 399,
      instructor: "Alex Rodriguez",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
      featured: false,
      bestseller: true,
      skills: ["React Native", "JavaScript", "Mobile UI", "API Integration"]
    },
    {
      id: 4,
      title: "AWS Cloud Practitioner",
      description: "Master Amazon Web Services and prepare for the AWS Cloud Practitioner certification.",
      category: "cloud",
      level: "Beginner",
      duration: "8 weeks",
      students: 6890,
      rating: 4.6,
      price: 199,
      originalPrice: 299,
      instructor: "David Kim",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop",
      featured: false,
      bestseller: false,
      skills: ["AWS", "Cloud Computing", "EC2", "S3", "Lambda"]
    },
    {
      id: 5,
      title: "Cybersecurity Fundamentals",
      description: "Learn essential cybersecurity concepts, threat analysis, and security best practices.",
      category: "security",
      level: "Beginner",
      duration: "6 weeks",
      students: 4320,
      rating: 4.5,
      price: 179,
      originalPrice: 249,
      instructor: "Lisa Thompson",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop",
      featured: false,
      bestseller: false,
      skills: ["Network Security", "Ethical Hacking", "Risk Assessment", "Compliance"]
    },
    {
      id: 6,
      title: "DevOps Engineering Complete Course",
      description: "Master CI/CD, Docker, Kubernetes, and cloud infrastructure automation.",
      category: "devops",
      level: "Advanced",
      duration: "14 weeks",
      students: 5670,
      rating: 4.8,
      price: 349,
      originalPrice: 499,
      instructor: "Robert Wilson",
      image: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=400&h=250&fit=crop",
      featured: true,
      bestseller: false,
      skills: ["Docker", "Kubernetes", "Jenkins", "AWS", "Terraform"]
    }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesCategory = activeCategory === "all" || course.category === activeCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "popular": return b.students - a.students;
      case "rating": return b.rating - a.rating;
      case "price-low": return a.price - b.price;
      case "price-high": return b.price - a.price;
      default: return 0;
    }
  });

  const featuredCourses = courses.filter(course => course.featured);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const CourseCard = ({ course, featured = false }) => (
    <motion.div
      className={`bg-richblack-800 rounded-xl overflow-hidden border transition-all duration-300 hover:scale-105 hover:shadow-xl group ${
        featured ? 'border-yellow-50/30' : 'border-richblack-700 hover:border-richblack-600'
      }`}
      variants={itemVariants}
      whileHover={{ y: -5 }}
    >
      <div className="relative">
        <img 
          src={course.image} 
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {course.bestseller && (
            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Bestseller
            </span>
          )}
          {featured && (
            <span className="bg-yellow-50 text-richblack-900 px-2 py-1 rounded-full text-xs font-semibold">
              Featured
            </span>
          )}
        </div>
        <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <FaPlay />
        </button>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-yellow-50 font-semibold">{course.level}</span>
          <button className="text-richblack-400 hover:text-yellow-50 transition-colors">
            <FaBookmark />
          </button>
        </div>
        
        <h3 className="text-lg font-semibold text-richblack-50 mb-2 group-hover:text-yellow-50 transition-colors">
          {course.title}
        </h3>
        
        <p className="text-richblack-300 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-richblack-400 mb-4">
          <span className="flex items-center gap-1">
            <FaClock /> {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <FaUsers /> {course.students.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <FaStar className="text-yellow-400" /> {course.rating}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {course.skills.slice(0, 3).map((skill, index) => (
            <span 
              key={index}
              className="bg-richblack-700 text-richblack-200 px-2 py-1 rounded text-xs"
            >
              {skill}
            </span>
          ))}
          {course.skills.length > 3 && (
            <span className="text-richblack-400 text-xs">+{course.skills.length - 3} more</span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-yellow-50">${course.price}</span>
            <span className="text-richblack-400 line-through ml-2">${course.originalPrice}</span>
          </div>
          <button className="bg-yellow-50 text-richblack-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-100 transition-all duration-300 flex items-center gap-2 group-hover:scale-105">
            Enroll Now <FaArrowRight />
          </button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-richblack-700">
          <p className="text-sm text-richblack-400">
            Instructor: <span className="text-richblack-200">{course.instructor}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-richblack-900">
      {/* Hero Section */}
      <motion.div 
        className="relative bg-gradient-to-br from-indigo-900 via-richblack-900 to-purple-900 py-20"
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative w-11/12 max-w-maxContent mx-auto text-center">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-white mb-6"
            initial={false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Our <span className="text-yellow-50">Courses</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-richblack-200 max-w-3xl mx-auto mb-8"
            initial={false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Master new skills and advance your career with our comprehensive, industry-relevant courses designed by experts.
          </motion.p>
        </div>
      </motion.div>

      <div className="w-11/12 max-w-maxContent mx-auto py-16 text-richblack-5">
        {/* Featured Courses */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured <span className="text-yellow-50">Courses</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} featured={true} />
            ))}
          </div>
        </section>

        {/* Search and Filter */}
        <section className="mb-12">
          <div className="bg-richblack-800 p-6 rounded-xl border border-richblack-700">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
                  <input
                    type="text"
                    placeholder="Search courses, skills, or instructors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>
              
              {/* Sort */}
              <div className="w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-3 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-12">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-yellow-50 text-richblack-900'
                    : 'bg-richblack-800 text-richblack-300 hover:bg-richblack-700 border border-richblack-700'
                }`}
              >
                {category.icon}
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </section>

        {/* All Courses */}
        <section>
          <h2 className="text-3xl font-bold mb-8">
            All Courses
            <span className="text-richblack-400 text-lg font-normal ml-3">
              ({sortedCourses.length} {sortedCourses.length === 1 ? 'course' : 'courses'})
            </span>
          </h2>
          
          {sortedCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-richblack-800 p-8 rounded-xl border border-richblack-700">
                <FaSearch className="text-4xl text-richblack-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-richblack-300 mb-2">No courses found</h3>
                <p className="text-richblack-400">Try adjusting your search terms or category filter.</p>
              </div>
            </div>
          )}
        </section>

        {/* Why Choose Our Courses */}
        <section className="mt-20">
          <div className="bg-gradient-to-r from-richblack-800 to-richblack-700 p-8 rounded-xl border border-richblack-600">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose Our <span className="text-yellow-50">Courses?</span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCode className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Industry-Relevant</h3>
                <p className="text-richblack-300 text-sm">Curriculum designed by industry experts</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaPlay className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Hands-On Projects</h3>
                <p className="text-richblack-300 text-sm">Real-world applications and portfolio building</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaClock className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Flexible Learning</h3>
                <p className="text-richblack-300 text-sm">Learn at your own pace, anytime</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <ImprovedFooter />
    </div>
  );
};

export default Courses;
