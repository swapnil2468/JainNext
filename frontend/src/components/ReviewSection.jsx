import React, { useEffect, useState, useContext } from 'react';
import ReviewCard from './ReviewCard';
import ConfirmModal from './ConfirmModal';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';

const STAR_PATH = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

// ── Display stars ────────────────────────────────────────────────────
const StarDisplay = ({ value, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => {
      const full = i < Math.floor(value);
      const partial = !full && i < value;
      const pct = partial ? Math.round((value - Math.floor(value)) * 100) : 0;
      return (
        <span key={i} className="relative inline-block flex-shrink-0" style={{ width: size, height: size }}>
          <svg className="absolute inset-0" width={size} height={size} viewBox="0 0 20 20">
            <path d={STAR_PATH} fill="#e5e7eb" />
          </svg>
          <span className="absolute inset-0 overflow-hidden" style={{ width: full ? '100%' : `${pct}%` }}>
            <svg width={size} height={size} viewBox="0 0 20 20">
              <path d={STAR_PATH} fill="#ef4444" />
            </svg>
          </span>
        </span>
      );
    })}
  </div>
);

// ── Interactive star picker ──────────────────────────────────────────
const StarPicker = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(null);
  const [hoveredHalf, setHoveredHalf] = useState(false);
  const displayed = hovered !== null ? (hoveredHalf ? hovered - 0.5 : hovered) : (value || 0);

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-1" onMouseLeave={() => { setHovered(null); setHoveredHalf(false); }}>
        {[1, 2, 3, 4, 5].map(star => {
          const isFull = displayed >= star;
          const isHalf = !isFull && displayed >= star - 0.5;
          return (
            <button key={star} type="button"
              style={{ width: 38, height: 38 }}
              className="relative flex-shrink-0 transition-transform duration-100 hover:scale-110 focus:outline-none"
              onMouseMove={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHovered(star);
                setHoveredHalf(e.clientX - rect.left < rect.width / 2);
              }}
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                onChange(e.clientX - rect.left < rect.width / 2 ? star - 0.5 : star);
              }}
            >
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 20 20">
                <path d={STAR_PATH} fill="#e5e7eb" />
              </svg>
              {(isFull || isHalf) && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: isHalf ? '50%' : '100%' }}>
                  <svg className="w-full h-full" viewBox="0 0 20 20">
                    <path d={STAR_PATH} fill="#ef4444" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
      {/* Score pill — neutral, red text only */}
      <span className="text-sm font-bold text-red-600 bg-neutral-100 rounded-lg px-3 py-1.5 tabular-nums">
        {(displayed || 0).toFixed(1)} / 5
      </span>
      <span className="text-xs text-neutral-400 hidden sm:inline">Hover · half stars supported</span>
    </div>
  );
};

// ── Main ─────────────────────────────────────────────────────────────
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
  const [sortBy, setSortBy] = useState('latest');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [serverAvgRating, setServerAvgRating] = useState(0);
  const [serverTotalReviews, setServerTotalReviews] = useState(0);
  const reviewsPerPage = 6;

  const fetchStats = async () => {
    try {
      const res = await axios.post(backendUrl + '/api/review/stats', { productId });
      if (res.data.success) { setServerAvgRating(res.data.avgRating); setServerTotalReviews(res.data.totalReviews); }
    } catch (_) {}
  };

  useEffect(() => { fetchReviews(1, true); fetchStats(); if (token) fetchUserData(); }, [productId, token]);
  useEffect(() => { if (userData) fetchReviews(1, true); }, [userData]);
  useEffect(() => { fetchReviews(1, true); }, [sortBy]);

  const fetchReviews = async (page = 1, reset = false) => {
    setLoadingMore(true);
    try {
      const res = await axios.post(backendUrl + '/api/review/list', { productId, userId: userData?._id, page, limit: reviewsPerPage, sortBy });
      if (res.data.success) {
        reset ? setReviews(res.data.reviews) : setReviews(prev => [...prev, ...res.data.reviews]);
        reset ? setCurrentPage(1) : setCurrentPage(page);
        setHasMore(res.data.pagination?.hasMore || false);
        setTotalReviews(res.data.pagination?.totalReviews || 0);
      }
    } catch (err) { console.error(err); } finally { setLoadingMore(false); }
  };

  const fetchUserData = async () => {
    try {
      const res = await axios.post(backendUrl + '/api/user/profile', {}, { headers: { token } });
      if (res.data.success) {
        setUserData(res.data.user);
        const rr = await axios.post(backendUrl + '/api/review/user', { productId, userId: res.data.user._id }, { headers: { token } });
        if (rr.data.success && rr.data.review) setUserReview(rr.data.review);
      }
    } catch (err) { console.error(err); }
  };

  const handleImageChange = (idx, file) => setImages(prev => { const a = [...prev]; a[idx] = file; return a; });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !userData) { toast.warn('Please login to add a review.'); return; }
    if (!rating || rating < 1) { toast.warn('Please select a rating.'); return; }
    setLoading(true);
    let uploadedImages = [];
    const filesToUpload = images.filter(Boolean);
    if (filesToUpload.length > 0) {
      const fd = new FormData();
      filesToUpload.forEach(img => fd.append('images', img));
      try {
        const res = await axios.post(backendUrl + '/api/review/upload-images', fd, { headers: { 'Content-Type': 'multipart/form-data', token } });
        if (res.data.success) uploadedImages = res.data.urls;
      } catch (err) { console.error(err); }
    }
    const res = await axios.post(backendUrl + '/api/review/add', {
      productId, userName: userData.name,
      rating: typeof rating === 'number' ? rating : 5,
      description: reviewText, images: uploadedImages
    }, { headers: { token } });
    setLoading(false);
    if (res.data.success) {
      setUserReview(res.data.review); fetchReviews(1, true); fetchStats();
      if (onReviewChange) onReviewChange();
      setReviewText(''); setRating(5); setImages([null, null, null, null]); setShowReviewForm(false);
      toast.success('Review submitted!');
    } else { toast.error(res.data.message); }
  };

  const handleDeleteReview = async () => {
    setShowConfirmDelete(false);
    try {
      const res = await axios.post(backendUrl + '/api/review/delete', { reviewId: userReview._id }, { headers: { token } });
      if (res.data.success) {
        setUserReview(null); fetchReviews(1, true); fetchStats();
        if (onReviewChange) onReviewChange();
        toast.success('Review deleted');
      } else { toast.error(res.data.message); }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const allForDist = userReview ? [userReview, ...reviews] : reviews;
  const ratingCounts = [0, 0, 0, 0, 0];
  allForDist.forEach(r => { const idx = Math.floor(r.rating) - 1; if (idx >= 0 && idx < 5) ratingCounts[4 - idx]++; });

  return (
    <div className="mt-20 space-y-5">

      {/* ── Heading row ── */}
      <div className="flex items-end justify-between flex-wrap gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-px w-6 bg-red-500 rounded-full" />
            <span className="text-xs font-semibold uppercase tracking-widest text-red-500">Reviews</span>
          </div>
          <h2 className="prata-regular text-3xl text-neutral-900">What Customers Say</h2>
        </div>
        {!userReview && (
          <button
            onClick={() => setShowReviewForm(v => !v)}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-xl transition-all duration-200"
            style={{
              backgroundColor: showReviewForm ? '#171717' : '#171717',
              color: '#fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#171717'}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            {showReviewForm ? 'Cancel' : 'Write a Review'}
          </button>
        )}
      </div>

      {/* ── Stats card ── */}
      <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="px-6 py-3.5 border-b border-neutral-100 bg-neutral-50">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Rating Overview</p>
        </div>
        <div className="p-6 flex flex-col sm:flex-row gap-8 items-start">
          <div className="flex flex-col items-center sm:pr-8 sm:border-r border-neutral-100 gap-2 min-w-[100px]">
            <span className="text-6xl font-bold text-neutral-900 leading-none tabular-nums">
              {serverAvgRating > 0 ? serverAvgRating.toFixed(1) : '—'}
            </span>
            <StarDisplay value={serverAvgRating} size={17} />
            <span className="text-xs text-neutral-400 font-medium mt-1">
              {serverTotalReviews} {serverTotalReviews === 1 ? 'review' : 'reviews'}
            </span>
          </div>
          <div className="flex-1 space-y-2.5 w-full">
            {[5, 4, 3, 2, 1].map((star, idx) => {
              const count = ratingCounts[idx];
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-9 flex-shrink-0">
                    <span className="text-xs font-medium text-neutral-500">{star}</span>
                    <svg width="10" height="10" viewBox="0 0 20 20" fill="#d1d5db"><path d={STAR_PATH} /></svg>
                  </div>
                  <div className="flex-1 rounded-full overflow-hidden bg-neutral-100" style={{ height: 5 }}>
                    <div className="h-full rounded-full bg-red-500 transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-neutral-400 w-5 text-right tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Write review form ── */}
      {!userReview && showReviewForm && (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="px-6 py-3.5 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Your Review</p>
            <button type="button" onClick={() => setShowReviewForm(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 transition-all text-lg leading-none">
              ×
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                Rating <span className="text-red-500">*</span>
              </label>
              <StarPicker value={rating} onChange={setRating} />
            </div>

            <div className="h-px bg-neutral-100" />

            {/* Text */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                Review <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-4 py-3.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 resize-none focus:outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition-all"
                placeholder="Share your honest experience with this product..."
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                required
                rows="4"
              />
            </div>

            <div className="h-px bg-neutral-100" />

            {/* Photos */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                Photos <span className="font-normal normal-case text-neutral-400">(optional · up to 4)</span>
              </label>
              <div className="flex gap-3 flex-wrap">
                {[0, 1, 2, 3].map(idx => (
                  <label key={idx} htmlFor={`rv-img-${idx}`} className="cursor-pointer group">
                    <div className={`w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-200 ${
                      images[idx]
                        ? 'border-2 border-neutral-300'
                        : 'border-2 border-dashed border-neutral-200 bg-neutral-50 group-hover:border-neutral-400 group-hover:bg-neutral-100'
                    }`}>
                      {images[idx] ? (
                        <img className="w-full h-full object-cover" src={URL.createObjectURL(images[idx])} alt="" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-neutral-300 group-hover:text-neutral-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-xs font-medium">Add</span>
                        </div>
                      )}
                    </div>
                    <input type="file" accept="image/*" id={`rv-img-${idx}`} hidden onChange={e => handleImageChange(idx, e.target.files[0])} />
                  </label>
                ))}
              </div>
            </div>

            <div className="h-px bg-neutral-100" />

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl bg-neutral-900 hover:bg-red-600 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting…</>
                  : 'Submit Review'}
              </button>
              <button type="button" onClick={() => setShowReviewForm(false)}
                className="text-sm font-medium px-6 py-3 rounded-xl border border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:border-neutral-300 bg-white transition-all duration-200">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── User's own review ── */}
      {userReview && (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="px-6 py-3.5 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Your Review</p>
            <button onClick={() => setShowConfirmDelete(true)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-200 bg-white transition-all duration-200">
              Delete
            </button>
          </div>
          <div className="p-5">
            <ReviewCard review={userReview} />
          </div>
        </div>
      )}

      {/* ── All reviews ── */}
      <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="px-6 py-3.5 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">All Reviews</p>
            {totalReviews > 0 && (
              <p className="text-xs text-neutral-400 mt-0.5">Showing {reviews.length} of {totalReviews}</p>
            )}
          </div>
          {totalReviews > 0 && (
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="text-xs font-medium border border-neutral-200 rounded-xl px-3 py-2 bg-white text-neutral-600 focus:outline-none focus:border-neutral-400 cursor-pointer transition-all">
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          )}
        </div>

        <div className="p-6">
          {reviews.length === 0 && !loadingMore ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-14 h-14 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-neutral-600 mb-1">No reviews yet</p>
              <p className="text-xs text-neutral-400">Be the first to share your experience</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.map(r => <ReviewCard key={r._id} review={r} />)}
              </div>
              {hasMore && (
                <div className="text-center mt-8">
                  <button onClick={() => fetchReviews(currentPage + 1, false)} disabled={loadingMore}
                    className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-xl border border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 bg-white transition-all duration-200 disabled:opacity-50">
                    {loadingMore
                      ? <><div className="w-4 h-4 border-2 border-neutral-200 border-t-neutral-600 rounded-full animate-spin" />Loading…</>
                      : <>Load More <span className="text-neutral-400 ml-1">({totalReviews - reviews.length} remaining)</span></>
                    }
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDeleteReview}
        title="Delete Review"
        message="Are you sure you want to delete your review? This action cannot be undone."
        confirmLabel="Yes, Delete"
        confirmClassName="bg-red-600 hover:bg-red-700 text-white"
      />
    </div>
  );
};

export default ReviewSection;