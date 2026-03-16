
import React, { useEffect, useState, useRef, useContext } from 'react';
import ReviewCard from './ReviewCard';
import ConfirmModal from './ConfirmModal';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';

// Quantize star fill to 0.2 steps (4.2, 4.4, etc)
function quantizeRating(val) {
  return Math.round(val * 5) / 5;
}

const StarInput = ({ value, onChange }) => {
  // value: number (e.g. 4.2)
  // onChange: function
  const [hover, setHover] = useState(null);
  // Quantize to 0.2 steps for fill
  const displayValue = hover !== null ? hover : (value || 5);
  const quantized = quantizeRating(displayValue);
  const widthPercent = Math.max(0, Math.min(100, (quantized / 5) * 100));
  // Handle click on stars
  const handleStarClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let percent = x / rect.width;
    let raw = percent * 5;
    let quant = quantizeRating(raw);
    quant = Math.max(1, Math.min(5, quant));
    onChange(quant);
  };
  return (
    <div className="flex items-center gap-2">
      <div
        className="relative flex text-3xl cursor-pointer select-none"
        style={{ width: '120px' }}
        title="Click to set rating"
        onMouseMove={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          let percent = x / rect.width;
          let raw = percent * 5;
          let quant = quantizeRating(raw);
          quant = Math.max(1, Math.min(5, quant));
          setHover(quant);
        }}
        onMouseLeave={() => setHover(null)}
        onClick={handleStarClick}
      >
        <div className="absolute top-0 left-0 h-full overflow-hidden" style={{ width: `${widthPercent}%`, pointerEvents: 'none', transition: 'width 0.15s ease-out' }}>
          <span style={{ color: '#ef4444' }}>★★★★★</span>
        </div>
        <div className="relative z-10 text-red-200">
          <span>★★★★★</span>
        </div>
      </div>
      <input
        type="number"
        min="1"
        max="5"
        step="0.1"
        value={value || ''}
        onChange={e => {
          let v = e.target.value;
          // Allow empty string for backspace
          if (v === '') {
            onChange('');
            return;
          }
          v = Math.max(1, Math.min(5, Number(v)));
          // Only allow one decimal place
          v = Math.round(v * 10) / 10;
          onChange(v);
        }}
        className="w-16 border border-red-200 rounded px-2 py-1 text-lg focus:border-red-400 focus:ring-1 focus:ring-red-200 focus:outline-none transition-colors duration-200"
        style={{ fontVariantNumeric: 'tabular-nums' }}
        onBlur={e => {
          // If empty, reset to 5
          if (e.target.value === '') onChange(5);
        }}
      />
    </div>
  );
};

const ReviewSection = ({ productId, token, onReviewChange }) => {
  const { backendUrl } = useContext(ShopContext);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [images, setImages] = useState([null, null, null, null]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState('latest'); // 'latest' or 'oldest'
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const reviewsPerPage = 6;

  // Server-side accurate stats (avg and total across ALL reviews, not just paginated)
  const [serverAvgRating, setServerAvgRating] = useState(0);
  const [serverTotalReviews, setServerTotalReviews] = useState(0);

  const fetchStats = async () => {
    try {
      const res = await axios.post(backendUrl + '/api/review/stats', { productId });
      if (res.data.success) {
        setServerAvgRating(res.data.avgRating);
        setServerTotalReviews(res.data.totalReviews);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchReviews(1, true); // Reset to page 1 when component mounts or productId changes
    fetchStats();
    if (token) fetchUserData();
    // eslint-disable-next-line
  }, [productId, token]);

  useEffect(() => {
    if (userData) {
      fetchReviews(1, true); // Reset when user data loads
    }
    // eslint-disable-next-line
  }, [userData]);

  // Reset pagination when sort changes
  useEffect(() => {
    fetchReviews(1, true);
    // eslint-disable-next-line
  }, [sortBy]);

  const fetchReviews = async (page = 1, reset = false) => {
    if (reset) {
      setLoadingMore(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const res = await axios.post(backendUrl + '/api/review/list', { 
        productId, 
        userId: userData?._id,
        page,
        limit: reviewsPerPage,
        sortBy
      });
      
      if (res.data.success) {
        if (reset) {
          // Reset reviews for new sort or initial load
          setReviews(res.data.reviews);
          setCurrentPage(1);
        } else {
          // Append new reviews when loading more
          setReviews(prev => [...prev, ...res.data.reviews]);
          setCurrentPage(page);
        }
        
        setHasMore(res.data.pagination?.hasMore || false);
        setTotalReviews(res.data.pagination?.totalReviews || 0);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMoreReviews = () => {
    fetchReviews(currentPage + 1, false);
  };
  
  const fetchUserData = async () => {
    try {
      const res = await axios.post(backendUrl + '/api/user/profile', {}, { headers: { token } });
      if (res.data.success) {
        setUserData(res.data.user);
        // Also fetch user's review
        const reviewRes = await axios.post(backendUrl + '/api/review/user', { productId, userId: res.data.user._id }, { headers: { token } });
        if (reviewRes.data.success && reviewRes.data.review) {
          setUserReview(reviewRes.data.review);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Admin-style image upload UI
  const handleImageChange = (idx, file) => {
    setImages(prev => {
      const arr = [...prev];
      arr[idx] = file;
      return arr;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !userData) {
      toast.warn('Please login or create an account to add a review.');
      return;
    }
    setLoading(true);
    let uploadedImages = [];
    const filesToUpload = images.filter(Boolean);
    if (filesToUpload.length > 0) {
      const formData = new FormData();
      filesToUpload.forEach(img => formData.append('images', img));
      try {
        const res = await axios.post(backendUrl + '/api/review/upload-images', formData, { 
          headers: { 
            'Content-Type': 'multipart/form-data',
            token 
          } 
        });
        if (res.data.success) uploadedImages = res.data.urls;
      } catch (err) {
        console.error('Image upload error:', err);
      }
    }
    const res = await axios.post(backendUrl + '/api/review/add', {
      productId,
      userName: userData.name,
      rating: typeof rating === 'number' ? rating : 5,
      description: reviewText,
      images: uploadedImages
    }, { headers: { token } });
    setLoading(false);
    if (res.data.success) {
      setUserReview(res.data.review);
      fetchReviews(1, true); // Reset to first page after adding review
      fetchStats(); // Refresh accurate stats
      if (onReviewChange) onReviewChange();
      setReviewText('');
      setRating(5);
      setImages([null, null, null, null]);
      setShowReviewForm(false);
      toast.success('Review added successfully!');
    } else {
      toast.error(res.data.message);
    }
  };

  const handleDeleteReview = async () => {
    setShowConfirmDelete(false);
    try {
      const res = await axios.post(backendUrl + '/api/review/delete', {
        reviewId: userReview._id
      }, { headers: { token } });
      
      if (res.data.success) {
        setUserReview(null);
        fetchReviews(1, true); // Reset to first page after deleting review
        fetchStats(); // Refresh accurate stats
        if (onReviewChange) onReviewChange();
        toast.success('Review deleted successfully');
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  };

  // Use server-side stats for accurate avg/total across ALL reviews (not just the loaded page)
  const displayTotalReviews = serverTotalReviews;
  const avgRating = serverAvgRating;
  
  // Rating distribution — calculated from the currently-loaded reviews (best approximation without a full-breakdown endpoint)
  const allReviews = userReview ? [userReview, ...reviews] : reviews;
  const ratingCounts = [0, 0, 0, 0, 0];
  allReviews.forEach(r => {
    const index = Math.floor(r.rating) - 1;
    if (index >= 0 && index < 5) ratingCounts[4 - index]++;
  });

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-6">Customer Reviews</h2>
      
      {/* Review Statistics Section */}
      <div className="bg-white rounded-lg p-6 mb-8 border-2 border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Average Rating */}
          <div className="flex flex-col items-center justify-center md:border-r md:border-gray-200 md:pr-8">
            <div className="text-5xl font-bold mb-2 text-red-600">{avgRating}</div>
            <div className="flex text-red-500 text-xl mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < Math.floor(avgRating) ? '★' : '☆'}</span>
              ))}
            </div>
            <div className="text-sm text-gray-600">{displayTotalReviews} {displayTotalReviews === 1 ? 'review' : 'reviews'}</div>
          </div>
          
          {/* Rating Distribution */}
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((star, idx) => (
              <div key={star} className="flex items-center gap-2 mb-1">
                <span className="text-sm w-8">{star} ★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${totalReviews > 0 ? (ratingCounts[idx] / totalReviews) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm w-8 text-gray-600">{ratingCounts[idx]}</span>
              </div>
            ))}
          </div>
          
          {/* Write Review Button */}
          <div className="flex items-center">
            {!userReview && (
              <button 
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap font-medium hover:scale-105 active:scale-95"
              >
                ✍ WRITE A REVIEW
              </button>
            )}
          </div>
        </div>
      </div>
      
      {userReview ? (
        <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold">Your Review</div>
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors duration-200"
            >
              Delete Review
            </button>
          </div>
          <ReviewCard review={userReview} />
        </div>
      ) : showReviewForm ? (
        <form id="review-form" onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg shadow-md border-2 border-gray-200">
          <div className="mb-2 font-semibold text-gray-800">Add a Review</div>
          <div className="flex gap-2 mb-4 items-center">
            <label className="mr-2 font-medium text-gray-700">Rating:</label>
            <StarInput value={rating} onChange={setRating} />
            <span className="text-gray-500 text-sm">(1.0 - 5.0, e.g. 4.2)</span>
          </div>
          <textarea
            className="border border-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-200 p-3 rounded-lg w-full mb-2 outline-none transition-all"
            placeholder="Write your review..."
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            required
            rows="4"
          />
          <div className="mb-4">
            <p className="block mb-2 font-medium">Upload Images (Optional)</p>
            <div className="flex gap-2">
              {[0,1,2,3].map(idx => (
                <label key={idx} htmlFor={`review-image-${idx}`} className="cursor-pointer">
                  <div className="w-20 h-20 border-2 border-red-200 rounded-lg flex items-center justify-center overflow-hidden hover:border-red-400 hover:shadow-md transition-all">
                    {images[idx] ? (
                      <img
                        className="w-full h-full object-cover"
                        src={URL.createObjectURL(images[idx])}
                        alt="Preview"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="text-xs">Add</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    id={`review-image-${idx}`}
                    hidden
                    onChange={e => handleImageChange(idx, e.target.files[0])}
                  />
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Review'}</button>
            <button 
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="bg-white border-2 border-red-200 hover:bg-red-50 text-red-700 px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
      
      {/* Sort and Reviews Grid */}
      <div className="mt-8">
        {totalReviews > 0 && (
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Reviews ({totalReviews})</h3>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="border-2 border-gray-300 rounded-lg px-3 py-1 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-200"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        )}
        {reviews.length === 0 && !loadingMore ? (
          <div className="text-red-400 text-center py-8 font-medium">No reviews yet. Be the first to review!</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map(r => <ReviewCard key={r._id} review={r} />)}
            </div>
            
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-6">
                <button 
                  onClick={loadMoreReviews}
                  disabled={loadingMore}
                  className="px-8 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    `Load More Reviews (${totalReviews - reviews.length} remaining)`
                  )}
                </button>
              </div>
            )}
            
            {/* Show total loaded */}
            {reviews.length > 0 && (
              <div className="text-center mt-4 text-sm text-gray-500">
                Showing {reviews.length} of {totalReviews} reviews
              </div>
            )}
          </>
        )}
      </div>
      
      <ConfirmModal 
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDeleteReview}
        title='Delete Review'
        message='Are you sure you want to delete your review? This action cannot be undone.'
        confirmLabel='Yes, Delete'
        confirmClassName='bg-red-600 hover:bg-red-700 text-white'
      />
    </div>
  );
};

export default ReviewSection;
