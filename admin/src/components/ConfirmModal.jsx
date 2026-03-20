import React from 'react';

const getAccent = (cls = '') => {
  if (cls.includes('red'))  return { ring: 'bg-red-50',  icon: 'text-red-500'  };
  if (cls.includes('blue')) return { ring: 'bg-blue-50', icon: 'text-blue-500' };
  if (cls.includes('green'))return { ring: 'bg-green-50',icon: 'text-green-500'};
  return { ring: 'bg-amber-50', icon: 'text-amber-500' };
};

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel    = 'Confirm',
  confirmClassName = 'bg-red-600 hover:bg-orange-500 text-white font-medium transition-all',
}) => {
  if (!isOpen) return null;

  const accent = getAccent(confirmClassName);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Body */}
        <div className="px-6 pt-8 pb-6 text-center">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${accent.ring}`}>
            <svg className={`w-7 h-7 ${accent.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>

          {/* Text */}
          {title && <h3 className="text-lg font-bold text-gray-900 mb-2 antialiased">{title}</h3>}
          <p className="text-sm text-gray-600 leading-relaxed antialiased">
            {message || 'Are you sure you want to proceed?'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors duration-150 rounded-lg antialiased"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg antialiased ${confirmClassName}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
