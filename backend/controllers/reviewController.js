import reviewModel from '../models/reviewModel.js';
import userModel from '../models/userModel.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from "cloudinary";

// Helper function to extract public_id from Cloudinary URL and delete image
const deleteCloudinaryImage = async (imageUrl) => {
    try {
        // Extract public_id from URL
        // Format: https://res.cloudinary.com/[cloud]/image/upload/v[version]/[public_id].[ext]
        const parts = imageUrl.split('/');
        const filename = parts[parts.length - 1];
        const publicId = filename.split('.')[0];
        
        // Find the upload index to get the full path
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex !== -1 && uploadIndex < parts.length - 1) {
            // Get everything after 'upload/' and before the file extension
            const pathAfterUpload = parts.slice(uploadIndex + 1).join('/');
            const fullPublicId = pathAfterUpload.substring(0, pathAfterUpload.lastIndexOf('.'));
            
            await cloudinary.uploader.destroy(fullPublicId);
            console.log(`Deleted image: ${fullPublicId}`);
        }
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
    }
};

// Upload review images
export const uploadReviewImages = async (req, res) => {
  try {
    const images = req.files;
    if (!images || images.length === 0) {
      return res.json({ success: false, message: 'No images provided' });
    }
    
    const imagesUrl = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
        return result.secure_url;
      })
    );
    
    res.json({ success: true, urls: imagesUrl });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get all reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId, userId, page = 1, limit = 6, sortBy = 'latest' } = req.body;
    
    // Exclude the user's own review if userId is provided
    const filter = { productId };
    if (userId) filter.userId = { $ne: userId };
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination info
    const totalReviews = await reviewModel.countDocuments(filter);
    
    // Determine sort order
    const sortOrder = sortBy === 'oldest' ? { date: 1 } : { date: -1 };
    
    // Get paginated reviews
    const reviews = await reviewModel.find(filter)
      .sort(sortOrder)
      .skip(skip)
      .limit(limit);
    
    // Calculate total pages
    const totalPages = Math.ceil(totalReviews / limit);
    const hasMore = page < totalPages;
    
    res.json({ 
      success: true, 
      reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews,
        hasMore,
        limit
      }
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Add a review
export const addReview = async (req, res) => {
  try {
    const { productId, userId, rating, description, images } = req.body;
    // Fetch userName from database — never trust the client-supplied name
    const user = await userModel.findById(userId).select('name');
    if (!user) return res.json({ success: false, message: 'User not found' });
    const userName = user.name;
    // Prevent duplicate review by same user for same product
    const existing = await reviewModel.findOne({ productId, userId });
    if (existing) return res.json({ success: false, message: 'You have already reviewed this product.' });
    const review = new reviewModel({ productId, userId, userName, rating, description, images });
    await review.save();
    res.json({ success: true, review });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get the user's own review for a product
export const getUserReview = async (req, res) => {
  try {
    const { productId, userId } = req.body;
    const review = await reviewModel.findOne({ productId, userId });
    res.json({ success: true, review });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId, userId } = req.body;
    const review = await reviewModel.findById(reviewId);
    
    if (!review) {
      return res.json({ success: false, message: 'Review not found' });
    }
    
    // Only allow user to delete their own review
    if (review.userId.toString() !== userId) {
      return res.json({ success: false, message: 'Not authorized to delete this review' });
    }
    
    // Delete images from Cloudinary if they exist
    if (review.images && review.images.length > 0) {
      await Promise.all(
        review.images.map(imageUrl => deleteCloudinaryImage(imageUrl))
      );
    }
    
    await reviewModel.findByIdAndDelete(reviewId);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get avg rating + total count for a product (lightweight — used by product page header)
export const getProductStats = async (req, res) => {
  try {
    const { productId } = req.body;
    const result = await reviewModel.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
    ]);
    if (result.length === 0) {
      return res.json({ success: true, avgRating: 0, totalReviews: 0 });
    }
    res.json({
      success: true,
      avgRating: Math.round(result[0].avgRating * 10) / 10,
      totalReviews: result[0].totalReviews
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
