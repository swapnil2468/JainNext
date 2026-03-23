import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'
import QuickViewModal from './QuickViewModal'

const ProductItem = ({id,slug,image,name,price,wholesalePrice,minimumWholesaleQuantity,stock}) => {
    
    const {currency, userProfile} = useContext(ShopContext);
    const [showQuickView, setShowQuickView] = useState(false);
    
    // Backward compatibility: price might be undefined for new products
    const displayPrice = price;

    // Handle quick view
    const handleQuickView = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setShowQuickView(true);
    };

  return (
    <>
      <Link onClick={()=>scrollTo(0,0)} to={`/product/${slug || id}`} className='group relative bg-white rounded-2xl border border-neutral-200/60 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-rose-900/10 hover:-translate-y-1 hover:border-rose-200 block text-gray-700 cursor-pointer'>
        <div className='relative aspect-square overflow-hidden bg-white border border-neutral-100 rounded-xl'>
          <img className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' src={image[0]} alt="" loading='lazy' />
          
          {/* Hover Action Buttons */}
          <div className='absolute inset-x-4 bottom-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300'>
            <button
              onClick={handleQuickView}
              className='w-full bg-white/95 backdrop-blur-sm text-neutral-900 text-sm font-medium py-3 rounded-full text-center whitespace-nowrap hover:bg-white transition-all duration-200'
            >
              Quick View
            </button>
          </div>
        </div>

        <div className='p-5 space-y-2'>
          <p className='text-sm font-medium text-neutral-900 group-hover:text-rose-700 transition-colors duration-200 line-clamp-2'>{name}</p>
          <div>
            {wholesalePrice && userProfile?.role === 'wholesale' && userProfile?.isApproved ? (
              <div className='text-sm'>
                <p className='font-medium text-green-700'>{currency}{wholesalePrice} <span className='text-xs text-gray-500'>(Wholesale)</span></p>
                <p className='text-xs text-gray-500 line-through'>{currency}{displayPrice}</p>
                <p className='text-xs text-gray-600'>Min qty: {minimumWholesaleQuantity || 10}</p>
              </div>
            ) : displayPrice ? (
              <p className='text-lg font-light text-neutral-900'>{currency}{displayPrice}</p>
            ) : null}
          </div>
          {stock === 0 ? (
            <p className='text-red-600 text-xs font-semibold mt-1'>Out of Stock</p>
          ) : stock && stock < 20 ? (
            <p className='text-red-600 text-xs font-semibold mt-1'>Only {stock} left!</p>
          ) : null}
        </div>
      </Link>

      {/* Quick View Modal - Need to get full product data */}
      {showQuickView && (
        <QuickViewModalWrapper productId={id} isOpen={showQuickView} onClose={() => setShowQuickView(false)} />
      )}
    </>
  )
}

// Helper component to load full product data for quick view
const QuickViewModalWrapper = ({ productId, isOpen, onClose }) => {
  const { products } = useContext(ShopContext);
  const product = products.find(p => p._id === productId);

  return <QuickViewModal isOpen={isOpen && !!product} product={product} onClose={onClose} />;
};

export default ProductItem
