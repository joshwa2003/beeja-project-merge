const FeaturedCourses = require('../models/FeaturedCourses');
const Course = require('../models/course');

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

        console.log('Update request received:', {
            popularPicks: popularPicks ? popularPicks.length : 'undefined',
            topEnrollments: topEnrollments ? topEnrollments.length : 'undefined',
            popularPicksData: popularPicks,
            topEnrollmentsData: topEnrollments
        });

        // Get current featured courses to check existing counts
        let currentFeaturedCourses = await FeaturedCourses.findOne();
        
        console.log('Current featured courses:', {
            currentPopularPicks: currentFeaturedCourses?.popularPicks?.length || 0,
            currentTopEnrollments: currentFeaturedCourses?.topEnrollments?.length || 0
        });

        // Validate course IDs
        const allCourseIds = [...(popularPicks || []), ...(topEnrollments || [])];
        if (allCourseIds.length > 0) {
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
        }

        // Update or create featured courses
        let featuredCourses = currentFeaturedCourses;
        
        if (featuredCourses) {
            if (popularPicks !== undefined) {
                featuredCourses.popularPicks = popularPicks;
            }
            if (topEnrollments !== undefined) {
                featuredCourses.topEnrollments = topEnrollments;
            }
            featuredCourses.lastUpdated = Date.now();
            await featuredCourses.save();
        } else {
            featuredCourses = await FeaturedCourses.create({
                popularPicks: popularPicks || [],
                topEnrollments: topEnrollments || []
            });
        }

        console.log('Featured courses updated successfully:', {
            popularPicksCount: featuredCourses.popularPicks.length,
            topEnrollmentsCount: featuredCourses.topEnrollments.length
        });

        return res.status(200).json({
            success: true,
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
