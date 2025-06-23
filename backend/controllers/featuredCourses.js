const FeaturedCourses = require('../models/FeaturedCourses');
const Course = require('../models/Course');

// Get featured courses
exports.getFeaturedCourses = async (req, res) => {
    try {
        let featuredCourses = await FeaturedCourses.findOne()
            .populate('popularPicks', 'courseName courseDescription thumbnail instructor studentsEnrolled ratingAndReviews status price')
            .populate('topEnrollments', 'courseName courseDescription thumbnail instructor studentsEnrolled ratingAndReviews status price');

        // If no featured courses exist yet, create default empty document
        if (!featuredCourses) {
            featuredCourses = await FeaturedCourses.create({
                popularPicks: [],
                topEnrollments: []
            });
        }

        // Filter out unpublished courses
        featuredCourses.popularPicks = featuredCourses.popularPicks.filter(course => course.status === 'Published');
        featuredCourses.topEnrollments = featuredCourses.topEnrollments.filter(course => course.status === 'Published');

        return res.status(200).json({
            success: true,
            data: featuredCourses
        });
    } catch (error) {
        console.error('Error in getFeaturedCourses:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching featured courses',
            error: error.message
        });
    }
};

// Update featured courses (admin only)
exports.updateFeaturedCourses = async (req, res) => {
    try {
        const { popularPicks, topEnrollments } = req.body;

        // Validate course IDs
        const allCourseIds = [...(popularPicks || []), ...(topEnrollments || [])];
        const validCourses = await Course.find({
            _id: { $in: allCourseIds },
            status: 'Published'
        });

        const validCourseIds = validCourses.map(course => course._id.toString());
        const invalidCourseIds = allCourseIds.filter(id => !validCourseIds.includes(id));

        if (invalidCourseIds.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Some course IDs are invalid or unpublished',
                invalidCourseIds
            });
        }

        // Update or create featured courses
        let featuredCourses = await FeaturedCourses.findOne();
        
        if (featuredCourses) {
            featuredCourses.popularPicks = popularPicks || featuredCourses.popularPicks;
            featuredCourses.topEnrollments = topEnrollments || featuredCourses.topEnrollments;
            featuredCourses.lastUpdated = Date.now();
            await featuredCourses.save();
        } else {
            featuredCourses = await FeaturedCourses.create({
                popularPicks,
                topEnrollments
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Featured courses updated successfully',
            data: featuredCourses
        });
    } catch (error) {
        console.error('Error in updateFeaturedCourses:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating featured courses',
            error: error.message
        });
    }
};
