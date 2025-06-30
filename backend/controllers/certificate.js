const Certificate = require("../models/certificate");
const Course = require("../models/course");
const User = require("../models/user");
const CourseProgress = require("../models/courseProgress");

// ================ Generate Certificate ================
exports.generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    // Check if course exists
    const course = await Course.findById(courseId);
    
    // Check if user has access to this course
    // First check if user is enrolled in the course
    const user = await User.findById(userId);
    const isEnrolled = user.courses.includes(courseId);
    
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not enrolled in this course.',
      });
    }
    
    // If enrolled, check if course is free or user has active order
    const isFree = course.courseType === 'Free' || course.adminSetFree;
    
    if (!isFree) {
      const Order = require('../models/order');
      const activeOrder = await Order.findOne({
        user: userId,
        course: courseId,
        status: true
      });

      // Allow certificate generation if user is enrolled, regardless of current course type
      // This ensures students who enrolled when course was free can still get certificates
      if (!activeOrder) {
        console.log(`Certificate generation allowed for enrolled student - User: ${userId}, Course: ${courseId}`);
      }
    }
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // User details already fetched above for enrollment check
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if course is 100% completed using existing logic
    const courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    }).populate({
      path: "courseID",
      populate: {
        path: "courseContent",
        populate: {
          path: "subSection",
          populate: {
            path: "quiz"
          }
        }
      }
    });

    if (!courseProgress) {
      return res.status(400).json({
        success: false,
        message: "Course progress not found. Please start the course first."
      });
    }

    // Calculate progress percentage using the same logic as getProgressPercentage
    let totalItems = 0;
    let completedItems = 0;

    courseProgress.courseID.courseContent?.forEach((section) => {
      section.subSection?.forEach((subsection) => {
        // Count video
        totalItems += 1;
        if (courseProgress.completedVideos.includes(subsection._id)) {
          completedItems += 1;
        }

        // Count quiz if exists
        if (subsection.quiz) {
          totalItems += 1;
          if (courseProgress.completedQuizzes.includes(subsection._id)) {
            completedItems += 1;
          }
        }
      });
    });

    let progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    
    // Round to 2 decimal places like in getProgressPercentage
    const multiplier = Math.pow(10, 2);
    progressPercentage = Math.round(progressPercentage * multiplier) / multiplier;

    console.log(`Certificate generation check - User: ${userId}, Course: ${courseId}, Progress: ${progressPercentage}%, Total Items: ${totalItems}, Completed: ${completedItems}`);

    if (progressPercentage < 100) {
      return res.status(400).json({
        success: false,
        message: "Course not completed yet. Complete all videos and quizzes to get certificate.",
        debug: {
          progressPercentage,
          totalItems,
          completedItems,
          completedVideos: courseProgress.completedVideos.length,
          completedQuizzes: courseProgress.completedQuizzes.length
        }
      });
    }

    // Check if certificate already exists
    let certificate = await Certificate.findOne({
      courseId: courseId,
      userId: userId
    });

    if (!certificate) {
      // Generate unique certificate ID with format: BA-25FJ2849
      // BA- -> company name with hyphen
      // 25 -> current year
      // FJ -> random 2 alphabets
      // 2849 -> random 4 numbers
      const generateCertificateId = () => {
        const companyPrefix = 'BA-';
        const currentYear = new Date().getFullYear().toString().slice(-2);
        
        // Generate 2 random alphabets
        const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomAlphabets = Array(2).fill(0)
          .map(() => alphabets.charAt(Math.floor(Math.random() * alphabets.length)))
          .join('');
        
        // Generate 4 random numbers
        const randomNumbers = Array(4).fill(0)
          .map(() => Math.floor(Math.random() * 10))
          .join('');
        
        return `${companyPrefix}${currentYear}${randomAlphabets}${randomNumbers}`;
      };

      let certificateId;
      let isUnique = false;
      
      // Ensure the generated ID is unique
      while (!isUnique) {
        certificateId = generateCertificateId();
        const existingCertificate = await Certificate.findOne({ certificateId });
        if (!existingCertificate) {
          isUnique = true;
        }
      }

      // Create new certificate
      certificate = await Certificate.create({
        certificateId,
        courseId,
        userId,
        courseName: course.courseName,
        studentName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        completionDate: new Date()
      });
    }

    return res.status(200).json({
      success: true,
      message: "Certificate generated successfully",
      data: certificate
    });

  } catch (error) {
    console.error("Error generating certificate:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ================ Verify Certificate ================
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId })
      .populate("courseId", "courseName")
      .populate("userId", "firstName lastName email");

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Certificate verified successfully",
      data: certificate
    });

  } catch (error) {
    console.error("Error verifying certificate:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ================ Get User Certificates ================
exports.getUserCertificates = async (req, res) => {
  try {
    const userId = req.user.id;

    const certificates = await Certificate.find({ userId })
      .populate("courseId", "courseName thumbnail")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Certificates fetched successfully",
      data: certificates
    });

  } catch (error) {
    console.error("Error fetching certificates:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
