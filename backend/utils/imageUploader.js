const cloudinary = require('cloudinary').v2;

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
    try {
        const options = { folder };
        if (height) options.height = height;
        if (quality) options.quality = quality;

        options.resource_type = 'auto';
        
        // Handle file upload to Cloudinary
        if (file.buffer) {
            // If file is in memory (buffer)
            return await cloudinary.uploader.upload(
                `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
                options
            );
        } else if (file.path) {
            // If file is stored on disk
            return await cloudinary.uploader.upload(file.path, options);
        } else {
            throw new Error('Invalid file format');
        }
    }
    catch (error) {
        console.log("Error while uploading image");
        console.log(error);
        throw error;
    }
}



// Function to delete a resource by public ID
exports.deleteResourceFromCloudinary = async (url) => {
    if (!url) return;

    try {
        // Extract public ID from Cloudinary URL
        let publicId = url;
        
        // If it's a full Cloudinary URL, extract the public ID
        if (url.includes('cloudinary.com')) {
            // Extract the public ID from the URL
            // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.extension
            const urlParts = url.split('/');
            const uploadIndex = urlParts.findIndex(part => part === 'upload');
            
            if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
                // Get everything after 'upload/v1234567890/' or 'upload/'
                const pathAfterUpload = urlParts.slice(uploadIndex + 1);
                
                // Remove version if present (starts with 'v' followed by numbers)
                if (pathAfterUpload[0] && pathAfterUpload[0].match(/^v\d+$/)) {
                    pathAfterUpload.shift();
                }
                
                // Join the remaining parts and remove file extension
                publicId = pathAfterUpload.join('/').replace(/\.[^/.]+$/, '');
            }
        }

        const result = await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted resource with public ID: ${publicId}`);
        console.log('Delete Resource result = ', result);
        return result;
    } catch (error) {
        console.error(`Error deleting resource with URL ${url}:`, error);
        // Don't throw error to prevent account deletion from failing
        console.log('Continuing with account deletion despite image deletion failure');
        return null;
    }
};
