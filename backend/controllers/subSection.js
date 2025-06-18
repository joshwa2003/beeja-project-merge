const Section = require('../models/section');
const SubSection = require('../models/subSection');
const Quiz = require('../models/quiz');
const { uploadImageToCloudinary } = require('../utils/imageUploader');

// ================ Update SubSection ================
exports.updateSubSection = async (req, res) => {
    try {
        const { sectionId, subSectionId, title, description, questions } = req.body;

        // validation
        if (!subSectionId) {
            return res.status(400).json({
                success: false,
                message: 'subSection ID is required to update'
            });
        }

        // find in DB
        const subSection = await SubSection.findById(subSectionId);

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

        // add data
        if (title) {
            subSection.title = title;
        }

        if (description) {
            subSection.description = description;
        }

        // upload video to cloudinary
        if (req.file) {
            const video = req.file;
            const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
            subSection.videoUrl = uploadDetails.secure_url;
            subSection.timeDuration = uploadDetails.duration;
        }

        // Handle quiz attachment
        if (req.body.quiz !== undefined) {
            if (req.body.quiz === '' || req.body.quiz === null) {
                // Remove quiz reference
                subSection.quiz = null;
            } else {
                // Attach existing quiz
                const quizExists = await Quiz.findById(req.body.quiz);
                if (quizExists) {
                    subSection.quiz = req.body.quiz;
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Quiz not found'
                    });
                }
            }
        }

        // save data to DB
        await subSection.save();

        const updatedSection = await Section.findById(sectionId).populate("subSection");

        return res.json({
            success: true,
            data: updatedSection,
            message: "Section updated successfully",
        });
    } catch (error) {
        console.error('Error while updating the section');
        console.error(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Error while updating the section",
        });
    }
};


// ================ create SubSection ================
exports.createSubSection = async (req, res) => {
    try {
        console.log('Creating SubSection - Request body:', req.body);
        console.log('Creating SubSection - File:', req.file);

        // extract data
        const { title, description, sectionId, questions } = req.body;

        // extract video file
        const videoFile = req.file;

        // validation
        if (!title || !description || !sectionId) {
            console.log('Validation failed: Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Title, description, and sectionId are required'
            });
        }

        if (!videoFile) {
            console.log('Validation failed: No video file provided');
            return res.status(400).json({
                success: false,
                message: 'Video file is required'
            });
        }

        console.log('Starting video upload to Cloudinary...');
        
        // upload video to cloudinary with timeout
        const uploadPromise = uploadImageToCloudinary(videoFile, process.env.FOLDER_NAME);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Upload timeout')), 300000) // 5 minutes timeout
        );
        
        const videoFileDetails = await Promise.race([uploadPromise, timeoutPromise]);
        console.log('Video uploaded successfully:', videoFileDetails.secure_url);

        // create entry in DB
        const SubSectionDetails = await SubSection.create({
            title, 
            timeDuration: videoFileDetails.duration || 0, 
            description, 
            videoUrl: videoFileDetails.secure_url 
        });

        console.log('SubSection created in DB:', SubSectionDetails._id);

        // Handle quiz attachment
        if (req.body.quiz && req.body.quiz !== '') {
            console.log('Attaching quiz:', req.body.quiz);
            const quizExists = await Quiz.findById(req.body.quiz);
            if (quizExists) {
                SubSectionDetails.quiz = req.body.quiz;
                await SubSectionDetails.save();
                console.log('Quiz attached successfully');
            } else {
                console.log('Quiz not found:', req.body.quiz);
                return res.status(400).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }
        }

        // link subsection id to section
        console.log('Updating section with new subsection...');
        const updatedSection = await Section.findByIdAndUpdate(
            { _id: sectionId },
            { $push: { subSection: SubSectionDetails._id } },
            { new: true }
        ).populate("subSection");

        if (!updatedSection) {
            console.log('Section not found:', sectionId);
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            });
        }

        console.log('SubSection created successfully');

        // return response
        res.status(200).json({
            success: true,
            data: updatedSection,
            message: 'SubSection created successfully'
        });
    }
    catch (error) {
        console.error('Error while creating SubSection:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while creating SubSection'
        });
    }
}






// ================ Delete SubSection ================
exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body
        await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $pull: {
                    subSection: subSectionId,
                },
            }
        )

        // delete from DB
        const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

        if (!subSection) {
            return res
                .status(404)
                .json({ success: false, message: "SubSection not found" })
        }

        const updatedSection = await Section.findById(sectionId).populate('subSection')

        // In frontned we have to take care - when subsection is deleted we are sending ,
        // only section data not full course details as we do in others 

        // success response
        return res.json({
            success: true,
            data: updatedSection,
            message: "SubSection deleted successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,

            error: error.message,
            message: "An error occurred while deleting the SubSection",
        })
    }
}