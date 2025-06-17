const Category = require('../models/category')
const Course = require('../models/course')

// get Random Integer
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

// Helper function to calculate average rating
function calculateAverageRating(ratingAndReviews) {
    if (!ratingAndReviews || ratingAndReviews.length === 0) {
        return { averageRating: 0, totalRatings: 0 };
    }
    
    const totalRating = ratingAndReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / ratingAndReviews.length;
    
    return {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        totalRatings: ratingAndReviews.length
    };
}

// ================ create Category ================
exports.createCategory = async (req, res) => {
    try {
        // extract data
        const { name, description } = req.body;

        // validation
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const categoryDetails = await Category.create({
            name: name, description: description
        });

        res.status(200).json({
            success: true,
            message: 'Category created successfully'
        });
    }
    catch (error) {
        console.log('Error while creating Category');
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error while creating Category',
            error: error.message
        })
    }
}


// ================ get All Category ================
exports.showAllCategories = async (req, res) => {
    try {
        console.log('Fetching all categories from database...');
        
        // get all category from DB
        const allCategories = await Category.find({}, { name: true, description: true });
        
        console.log(`Found ${allCategories.length} categories`);

        if (!allCategories) {
            console.log('No categories found in database');
            return res.status(404).json({
                success: false,
                message: 'No categories found'
            });
        }

        // return response
        res.status(200).json({
            success: true,
            data: allCategories,
            message: 'Categories fetched successfully'
        });
    }
    catch (error) {
        console.error('Error while fetching categories:', {
            message: error.message,
            stack: error.stack
        });
        
        res.status(500).json({
            success: false,
            message: 'Error while fetching categories',
            error: error.message
        });
    }
}



exports.getCategoryPageDetails = async (req, res) => {
    try {
        const { categoryId } = req.body

        // First get the category
        const selectedCategory = await Category.findById(categoryId).lean();

        if (!selectedCategory) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        console.log('Selected category found:', selectedCategory ? 'Yes' : 'No');
        console.log('Course IDs in category:', selectedCategory?.courses?.length || 0);

        // Get courses that match the criteria
        console.log('Searching for courses with IDs:', selectedCategory.courses);
        const courses = await Course.find({
            _id: { $in: selectedCategory.courses },
            status: "Published",
            isVisible: true
        })
        .populate([
            {
                path: "instructor",
                select: "firstName lastName email"
            },
            {
                path: "ratingAndReviews"
            },
            {
                path: "category",
                select: "name"
            }
        ])
        .lean();

        console.log('Found matching courses:', courses.length);
        if (courses.length > 0) {
            console.log('First course raw data:', JSON.stringify(courses[0], null, 2));
            console.log('First course details:', {
                id: courses[0]._id,
                name: courses[0].courseName,
                description: courses[0].courseDescription,
                instructor: courses[0].instructor,
                category: courses[0].category,
                price: courses[0].price,
                status: courses[0].status,
                isVisible: courses[0].isVisible
            });
        }

        // Replace the course IDs with the actual course objects
        selectedCategory.courses = courses;

        if (selectedCategory.courses.length === 0) {
            return res.status(404).json({
                success: false,
                data: null,
                message: "No courses found for the selected category.",
            })
        }

        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryId },
        }).lean()

        // Get a different category
        let differentCategory = await Category.findOne(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]._id
        ).lean();

        // Get courses for different category
        const differentCategoryCourses = await Course.find({
            _id: { $in: differentCategory.courses },
            status: "Published",
            isVisible: true
        })
        .populate([
            {
                path: "instructor",
                select: "firstName lastName email"
            },
            {
                path: "ratingAndReviews"
            },
            {
                path: "category",
                select: "name"
            }
        ])
        .lean();

        // Replace course IDs with actual course objects
        differentCategory.courses = differentCategoryCourses;

        // Get all categories
        const allCategories = await Category.find().lean();

        // Get all published and visible courses
        const allCourses = await Course.find({
            _id: { $in: allCategories.flatMap(category => category.courses) },
            status: "Published",
            isVisible: true
        })
        .populate([
            {
                path: "instructor",
                select: "firstName lastName email"
            },
            {
                path: "ratingAndReviews"
            },
            {
                path: "category",
                select: "name"
            }
        ])
        .lean();

        // Create a set of selectedCategory course IDs for filtering
        const selectedCourseIds = new Set(selectedCategory.courses.map(course => course._id.toString()))

        // Filter mostSellingCourses to exclude courses already in selectedCategory
        let mostSellingCourses = allCourses
            .filter(course => !selectedCourseIds.has(course._id.toString()))
            .sort((a, b) => (b.studentsEnrolled?.length || 0) - (a.studentsEnrolled?.length || 0))
            .slice(0, 10)

        // Add courses from differentCategory as additional related courses, excluding duplicates
        const differentCategoryCourseIds = new Set(differentCategory.courses.map(course => course._id.toString()))
        const additionalCourses = differentCategory.courses.filter(course => !selectedCourseIds.has(course._id.toString()))

        // Combine mostSellingCourses and additionalCourses, ensuring no duplicates
        const combinedCoursesMap = new Map()
        mostSellingCourses.forEach(course => combinedCoursesMap.set(course._id.toString(), course))
        additionalCourses.forEach(course => {
            if (!combinedCoursesMap.has(course._id.toString())) {
                combinedCoursesMap.set(course._id.toString(), course)
            }
        })

        mostSellingCourses = Array.from(combinedCoursesMap.values())

        // Calculate average rating for all courses
        selectedCategory.courses = selectedCategory.courses.map(course => {
            const ratingData = calculateAverageRating(course.ratingAndReviews);
            return {
                ...course,
                averageRating: ratingData.averageRating,
                totalRatings: ratingData.totalRatings
            };
        });

        differentCategory.courses = differentCategory.courses.map(course => {
            const ratingData = calculateAverageRating(course.ratingAndReviews);
            return {
                ...course,
                averageRating: ratingData.averageRating,
                totalRatings: ratingData.totalRatings
            };
        });

        mostSellingCourses = mostSellingCourses.map(course => {
            const ratingData = calculateAverageRating(course.ratingAndReviews);
            return {
                ...course,
                averageRating: ratingData.averageRating,
                totalRatings: ratingData.totalRatings
            };
        });

        res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategory,
                mostSellingCourses,
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}
