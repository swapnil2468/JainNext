import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import {Link} from 'react-router-dom'

const ProductItem = ({id,image,name,price,wholesalePrice,minimumWholesaleQuantity,stock}) => {
    
    const {currency, userProfile} = useContext(ShopContext);
    
    // Backward compatibility: price might be undefined for new products
    const displayPrice = price;

  return (
    <Link onClick={()=>scrollTo(0,0)} to={`/product/${id}`} className='group relative bg-white rounded-2xl border border-neutral-200/60 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-rose-900/10 hover:-translate-y-1 hover:border-rose-200 block text-gray-700 cursor-pointer'>
      <div className='relative aspect-square overflow-hidden bg-white border border-neutral-100 rounded-xl'>
        <img className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' src={image[0]} alt="" />
        
        {/* Hover Action Buttons */}
        <div className='absolute inset-x-4 bottom-4 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300'>
          <div className='flex-1 bg-white/95 backdrop-blur-sm text-neutral-900 text-sm font-medium py-3 rounded-full text-center whitespace-nowrap'>
            Quick View
          </div>
          <div className='w-12 h-12 flex items-center justify-center bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-full'>
            <i className='ri-shopping-bag-line'></i>
          </div>
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
  )
}

export default ProductItem
