import React from 'react';

const ReviewCard = ({ review }) => {
  const rating = review.rating || 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 h-full flex flex-col hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-700">
          {review.userName?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <div className="font-semibold">{review.userName}</div>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-red-500">
              {Array.from({ length: fullStars }).map((_, i) => <span key={`full-${i}`}>★</span>)}
              {hasHalfStar && <span>⯨</span>}
            </span>
            <span className="text-red-200">
              {Array.from({ length: emptyStars }).map((_, i) => <span key={`empty-${i}`}>★</span>)}
            </span>
            <span className="text-gray-600 ml-1">({rating.toFixed(1)})</span>
          </div>
          <div className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</div>
        </div>
      </div>
      <div className="mb-2 text-gray-700 flex-1 overflow-hidden">
        <p className="line-clamp-3">{review.description}</p>
      </div>
      {review.images && review.images.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {review.images.slice(0, 4).map((img, idx) => (
            <img key={idx} src={img} alt="review" className="w-14 h-14 object-cover rounded border border-gray-200 hover:border-gray-400 transition-colors" />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
