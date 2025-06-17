const Course = require('../models/course');
const User = require('../models/user');
const Category = require('../models/category');
const Section = require('../models/section')
const SubSection = require('../models/subSection')
const CourseProgress = require('../models/courseProgress')
const RatingAndReview = require('../models/ratingAndReview')

const { uploadImageToCloudinary, deleteResourceFromCloudinary } = require('../utils/imageUploader');
const { convertSecondsToDuration } = require("../utils/secToDuration")
const mongoose = require('mongoose');

// Helper function to calculate average rating
const calculateAverageRating = async (courseId) => {
    try {
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { 
                        $avg: "$rating"
                    },
                    totalRatings: { $sum: 1 }
                }
            }
        ]);

        if (result.length > 0) {
            return {
                averageRating: result[0].averageRating,
                totalRatings: result[0].totalRatings
            };
        }
        
        return {
            averageRating: 0,
            totalRatings: 0
        };
    } catch (error) {
        console.log('Error calculating average rating:', error);
        return {
            averageRating: 0,
            totalRatings: 0
        };
    }
};

// ================ create new course ================
exports.createCourse = async (req, res) => {
    try {
        console.log('=== CREATE COURSE REQUEST ===');
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);

        // extract data
        let { courseName, courseDescription, whatYouWillLearn, price, category, instructions: _instructions, status, tag: _tag } = req.body;

        // Handle tag and instructions - they can be either JSON strings or arrays
        let tag = _tag;
        let instructions = _instructions;
        
        // Handle tag parsing
        if (_tag) {
            try {
                if (typeof _tag === 'string') {
                    tag = JSON.parse(_tag);
                }
            } catch (e) {
                console.log('Error parsing tag:', e);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid tag format'
                });
            }
        } else {
            tag = [];
        }

        // Handle instructions parsing
        if (_instructions) {
            try {
                if (typeof _instructions === 'string') {
                    instructions = JSON.parse(_instructions);
                }
            } catch (e) {
                console.log('Error parsing instructions:', e);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid instructions format'
                });
            }
        } else {
            instructions = [];
        }

        // get thumbnail of course
        const thumbnail = req.files?.thumbnailImage;

        // validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided (courseName, courseDescription, whatYouWillLearn, price, category, thumbnail)'
            });
        }

        if (!Array.isArray(instructions) || instructions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one instruction is required'
            });
        }

        if (!Array.isArray(tag) || tag.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one tag is required'
            });
        }

        if (!status || status === undefined) {
            status = "Draft";
        }

        // check current user is instructor or not
        const instructorId = req.user.id;

        // check given category is valid or not
        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(401).json({
                success: false,
                message: 'Category Details not found'
            })
        }

        // upload thumbnail to cloudinary
        const thumbnailDetails = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        if (!thumbnailDetails || !thumbnailDetails.secure_url) {
            return res.status(500).json({
                success: false,
                message: 'Failed to upload thumbnail image'
            });
        }

        // create new course - entry in DB
        const newCourse = await Course.create({
            courseName, 
            courseDescription, 
            instructor: instructorId, 
            whatYouWillLearn, 
            price, 
            category: categoryDetails._id,
            tag, 
            status, 
            instructions, 
            thumbnail: thumbnailDetails.secure_url, 
            createdAt: Date.now(),
            courseType: 'Paid', // Default to Paid for new courses
            adminSetFree: false,
            originalPrice: price
        });

        // add course id to instructor courses list
        await User.findByIdAndUpdate(instructorId,
            {
                $push: {
                    courses: newCourse._id
                }
            },
            { new: true }
        );

        // Add the new course to the Categories
        await Category.findByIdAndUpdate(
            { _id: category },
            {
                $push: {
                    courses: newCourse._id,
                },
            },
            { new: true }
        );

        // return response
        res.status(200).json({
            success: true,
            data: newCourse,
            message: 'New Course created successfully'
        })
    }

    catch (error) {
        console.log('=== ERROR CREATING COURSE ===');
        console.log('Error message:', error.message);
        console.log('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while creating new course'
        })
    }
}


// ================ show all courses ================
exports.getAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({},
            {
                courseName: true, courseDescription: true, price: true, thumbnail: true, instructor: true,
                ratingAndReviews: true, studentsEnrolled: true, courseType: true, originalPrice: true,
                adminSetFree: true
            })
            .populate({
                path: 'instructor',
                select: 'firstName lastName email image'
            })
            .exec();

        // Add average rating to each course
        const coursesWithRating = await Promise.all(
            allCourses.map(async (course) => {
                const ratingData = await calculateAverageRating(course._id);
                return {
                    ...course.toObject(),
                    averageRating: ratingData.averageRating,
                    totalRatings: ratingData.totalRatings
                };
            })
        );

        return res.status(200).json({
            success: true,
            data: coursesWithRating,
            message: 'Data for all courses fetched successfully'
        });
    }

    catch (error) {
        console.log('Error while fetching data of all courses');
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while fetching data of all courses'
        })
    }
}



// ================ Get Course Details ================
exports.getCourseDetails = async (req, res) => {
    try {
        // get course ID
        const { courseId } = req.body;

        // find course details
        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                    select: "-videoUrl",
                },
            })
            .exec()


        //validation
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find the course with ${courseId}`,
            });
        }

        // if (courseDetails.status === "Draft") {
        //   return res.status(403).json({
        //     success: false,
        //     message: `Accessing a draft course is forbidden`,
        //   });
        // }

        // console.log('courseDetails -> ', courseDetails)
        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        // Calculate average rating
        const ratingData = await calculateAverageRating(courseId);

        //return response
        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
                averageRating: ratingData.averageRating,
                totalRatings: ratingData.totalRatings
            },
            message: 'Fetched course data successfully'
        })
    }

    catch (error) {
        console.log('Error while fetching course details');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while fetching course details',
        });
    }
}


// ================ Get Full Course Details ================
exports.getFullCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body
        const userId = req.user.id
        // console.log('courseId userId  = ', courseId, " == ", userId)

        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        let courseProgressCount = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        })

        //   console.log("courseProgressCount : ", courseProgressCount)

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: `Could not find course with id: ${courseId}`,
            })
        }

        // if (courseDetails.status === "Draft") {
        //   return res.status(403).json({
        //     success: false,
        //     message: `Accessing a draft course is forbidden`,
        //   });
        // }

        //   count total time duration of course
        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        // Calculate average rating
        const ratingData = await calculateAverageRating(courseId);

        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
                completedVideos: courseProgressCount?.completedVideos ? courseProgressCount?.completedVideos : [],
                averageRating: ratingData.averageRating,
                totalRatings: ratingData.totalRatings
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}



// ================ Edit Course Details ================
exports.editCourse = async (req, res) => {
    try {
        const { courseId } = req.body
        const updates = req.body
        const course = await Course.findById(courseId)

        if (!course) {
            return res.status(404).json({ error: "Course not found" })
        }

        // If Thumbnail Image is found, update it
        if (req.files) {
            // console.log("thumbnail update")
            const thumbnail = req.files.thumbnailImage
            const thumbnailImage = await uploadImageToCloudinary(
                thumbnail,
                process.env.FOLDER_NAME
            )
            course.thumbnail = thumbnailImage.secure_url
        }

        // Update only the fields that are present in the request body
        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                if (key === "tag" || key === "instructions") {
                    course[key] = JSON.parse(updates[key])
                } else {
                    course[key] = updates[key]
                }
            }
        }

        // updatedAt
        course.updatedAt = Date.now();

        //   save data
        await course.save()

        const updatedCourse = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        // success response
        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Error while updating course",
            error: error.message,
        })
    }
}



// ================ Get a list of Course for a given Instructor ================
exports.getInstructorCourses = async (req, res) => {
    try {
        // Get the instructor ID from the authenticated user or request body
        const instructorId = req.user.id

        // Find all courses belonging to the instructor
        const instructorCourses = await Course.find({ instructor: instructorId, }).sort({ createdAt: -1 })


        // Return the instructor's courses
        res.status(200).json({
            success: true,
            data: instructorCourses,
            // totalDurationInSeconds:totalDurationInSeconds,
            message: 'Courses made by Instructor fetched successfully'
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Failed to retrieve instructor courses",
            error: error.message,
        })
    }
}



// ================ Delete the Course ================
exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.body

        // Find the course
        const course = await Course.findById(courseId)
        if (!course) {
            return res.status(404).json({ message: "Course not found" })
        }

        // Unenroll students from the course
        const studentsEnrolled = course.studentsEnrolled
        for (const studentId of studentsEnrolled) {
            await User.findByIdAndUpdate(studentId, {
                $pull: { courses: courseId },
            })
        }

        // delete course thumbnail From Cloudinary
        await deleteResourceFromCloudinary(course?.thumbnail);

        // Delete sections and sub-sections
        const courseSections = course.courseContent
        for (const sectionId of courseSections) {
            // Delete sub-sections of the section
            const section = await Section.findById(sectionId)
            if (section) {
                const subSections = section.subSection
                for (const subSectionId of subSections) {
                    const subSection = await SubSection.findById(subSectionId)
                    if (subSection) {
                        await deleteResourceFromCloudinary(subSection.videoUrl) // delete course videos From Cloudinary
                    }
                    await SubSection.findByIdAndDelete(subSectionId)
                }
            }

            // Delete the section
            await Section.findByIdAndDelete(sectionId)
        }

        // Delete the course
        await Course.findByIdAndDelete(courseId)

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Error while Deleting course",
            error: error.message,
        })
    }
}




