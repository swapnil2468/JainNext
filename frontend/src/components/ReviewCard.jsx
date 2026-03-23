import React, { useState } from 'react';

const STAR_PATH = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

const ReviewCard = ({ review }) => {
  const rating = review.rating || 0;
  const [expandedImg, setExpandedImg] = useState(null);

  const initials = review.userName?.[0]?.toUpperCase() || '?';
  const hue = (review.userName?.charCodeAt(0) || 65) % 360;

  return (
    <>
      <div className="bg-white border border-neutral-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-neutral-200 hover:shadow-md transition-all duration-200" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: `hsl(${hue},30%,92%)`, color: `hsl(${hue},40%,35%)` }}
            >
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-800 leading-tight">{review.userName}</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
          {/* Rating badge — red accent, neutral background */}
          <div className="flex items-center gap-1 bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 flex-shrink-0">
            <svg width="11" height="11" viewBox="0 0 20 20" fill="#ef4444"><path d={STAR_PATH} /></svg>
            <span className="text-xs font-bold text-neutral-700 tabular-nums">{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => {
            const full = i < Math.floor(rating);
            const partial = !full && i < rating;
            const pct = partial ? Math.round((rating - Math.floor(rating)) * 100) : 0;
            return (
              <span key={i} className="relative inline-block flex-shrink-0" style={{ width: 14, height: 14 }}>
                <svg className="absolute inset-0" width="14" height="14" viewBox="0 0 20 20">
                  <path d={STAR_PATH} fill="#e5e7eb" />
                </svg>
                <span className="absolute inset-0 overflow-hidden" style={{ width: full ? '100%' : `${pct}%` }}>
                  <svg width="14" height="14" viewBox="0 0 20 20">
                    <path d={STAR_PATH} fill="#ef4444" />
                  </svg>
                </span>
              </span>
            );
          })}
        </div>

        {/* Review text */}
        <p className="text-sm text-neutral-600 leading-relaxed line-clamp-4">{review.description}</p>

        {/* Images */}
        {review.images?.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {review.images.slice(0, 4).map((img, idx) => (
              <button key={idx} onClick={() => setExpandedImg(img)}
                className="w-16 h-16 rounded-xl overflow-hidden border border-neutral-100 hover:border-neutral-300 hover:scale-105 transition-all duration-200 flex-shrink-0">
                <img src={img} alt="review" className="w-full h-full object-cover" loading='lazy' />
              </button>
            ))}
          </div>
        )}
      </div>

      {expandedImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={() => setExpandedImg(null)}>
          <img src={expandedImg} alt="enlarged" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain" />
        </div>
      )}
    </>
  );
};

export default ReviewCard;