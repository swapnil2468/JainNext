import express from 'express';
import { getProductReviews, addReview, getUserReview, deleteReview, uploadReviewImages, getProductStats } from '../controllers/reviewController.js';
import authUser from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const reviewRouter = express.Router();

// Get all reviews for a product (excluding user's own)
reviewRouter.post('/list', getProductReviews);
// Get avg rating + total count (lightweight)
reviewRouter.post('/stats', getProductStats);
// Add a review (user must be authenticated)
reviewRouter.post('/add', authUser, addReview);
// Get user's own review for a product
reviewRouter.post('/user', authUser, getUserReview);
// Delete a review (user must be authenticated)
reviewRouter.post('/delete', authUser, deleteReview);
// Upload review images
reviewRouter.post('/upload-images', authUser, upload.array('images', 4), uploadReviewImages);

export default reviewRouter;
