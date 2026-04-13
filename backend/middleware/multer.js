import multer from "multer";

const storage = multer.diskStorage({
    filename:function(req,file,callback){
        callback(null,file.originalname)
    }
})

// Only allow image files
const imageFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
    }
};

const upload = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 15 * 1024 * 1024 } // 15 MB max per file
})

// Custom error handler middleware for Multer
const handleMulterError = (uploadMiddleware) => {
    return (req, res, next) => {
        uploadMiddleware(req, res, (err) => {
            if (err) {
                // Handle specific Multer errors
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: 'File too large. Maximum file size is 10MB'
                    });
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({
                        success: false,
                        message: 'Too many files uploaded'
                    });
                }
                if (err.message && err.message.includes('Only image files')) {
                    return res.status(400).json({
                        success: false,
                        message: err.message
                    });
                }
                // Generic error handler
                return res.status(400).json({
                    success: false,
                    message: err.message || 'File upload error'
                });
            }
            next();
        });
    };
};

export default upload;
export { handleMulterError };