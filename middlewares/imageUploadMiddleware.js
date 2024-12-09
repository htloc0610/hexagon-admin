const multer = require('multer');
const {cloudinary} = require('../configs/cloudinaryConfig');

const uploadPhoto = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn file ảnh upload dưới 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Invalid file type'));
    }
});

const uploadToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        }).end(buffer);
    });
}

const resizeAndUploadImage = async (req, res, next) => {
    if (!req.files || req.files.length === 0) return next();

    try {
        // Function to upload each file to Cloudinary
        const uploadToCloudinary = (file) => {
            return cloudinary.uploader.upload_stream(
                {
                    resource_type: 'image', // Ensure it's recognized as an image
                    transformation: [{ width: 200, height: 200, crop: 'limit' }], // Resize settings
                },
                (error, result) => {
                    if (error) throw error;
                    return result;
                }
            ).end(file.buffer); // Use file.buffer for upload
        };

        // Map over files to upload them
        const uploadPromises = req.files.map((file) => 
            new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'image',
                        transformation: [{ width: 200, height: 200, crop: 'limit' }],
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                ).end(file.buffer); // Pass the buffer
            })
        );

        const results = await Promise.all(uploadPromises); // Wait for all uploads to complete
        req.imageUrl = results.map((result) => result.secure_url); // Store secure URLs in req.imageUrls

        next();
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        next(error);
    }
};
  
module.exports = { uploadPhoto, resizeAndUploadImage };