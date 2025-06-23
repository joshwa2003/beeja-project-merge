const express = require('express');
const router = express.Router();

// Import required controllers

// course controllers 
const {
    createCourse,
    getCourseDetails,
    getAllCourses,
    getFullCourseDetails,
    editCourse,
    deleteCourse,
    getInstructorCourses,

} = require('../controllers/course')

const { updateCourseProgress, updateQuizProgress, checkSectionAccess, getProgressPercentage } = require('../controllers/courseProgress')

// categories Controllers
const {
    createCategory,
    showAllCategories,
    getCategoryPageDetails,
} = require('../controllers/category');


// sections controllers
const {
    createSection,
    updateSection,
    deleteSection,
} = require('../controllers/section');


// subSections controllers
const {
    createSubSection,
    updateSubSection,
    deleteSubSection
} = require('../controllers/subSection');


// rating controllers
const {
    createRating,
    getAverageRating,
    getAllRatingReview
} = require('../controllers/ratingAndReview');


// Middlewares
const { auth, isAdmin, isInstructor, isStudent } = require('../middleware/auth')
const { upload } = require('../middleware/multer')


// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************
// Courses can Only be Created by Admins

router.post('/createCourse', auth, isAdmin, upload.single('thumbnailImage'), createCourse);

//Add a Section to a Course
router.post('/addSection', auth, isAdmin, createSection);
// Update a Section
router.post('/updateSection', auth, isAdmin, updateSection);
// Delete a Section
router.post('/deleteSection', auth, isAdmin, deleteSection);

// Add a Sub Section to a Section
router.post('/addSubSection', auth, isAdmin, upload.single('video'), createSubSection);
// Edit Sub Section
router.post('/updateSubSection', auth, isAdmin, upload.single('videoFile'), updateSubSection);
// Delete Sub Section
router.post('/deleteSubSection', auth, isAdmin, deleteSubSection);


// Get Details for a Specific Courses
router.post('/getCourseDetails', getCourseDetails);
// Get all Courses
router.get('/getAllCourses', getAllCourses);
// get full course details
router.post('/getFullCourseDetails', auth, getFullCourseDetails);
// Get all Courses Under a Specific Admin
router.get("/getInstructorCourses", auth, isAdmin, getInstructorCourses)

// Get all Courses Under a Specific Instructor
router.get("/getInstructorCoursesForInstructor", auth, isInstructor, getInstructorCourses)


// Edit Course routes - Allow both instructors and admins
router.post("/editCourse", auth, upload.single('thumbnailImage'), editCourse)

// Delete a Course - Allow both instructors and admins
router.delete("/deleteCourse", auth, deleteCourse)

// update Course Progress
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress)

// update Quiz Progress
router.post("/updateQuizProgress", auth, isStudent, updateQuizProgress)

// check Section Access
router.post("/checkSectionAccess", auth, isStudent, checkSectionAccess)

// get Progress Percentage
router.post("/getProgressPercentage", auth, isStudent, getProgressPercentage)


// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin

router.post('/createCategory', auth, isAdmin, createCategory);
router.get('/showAllCategories', showAllCategories);
router.post("/getCategoryPageDetails", getCategoryPageDetails)


// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
router.post('/createRating', auth, isStudent, createRating);
router.get('/getAverageRating', getAverageRating);
router.get('/getReviews', getAllRatingReview);


module.exports = router;
