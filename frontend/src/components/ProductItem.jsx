import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import {Link} from 'react-router-dom'

const ProductItem = ({id,image,name,price,wholesalePrice,minimumWholesaleQuantity,stock}) => {
    
    const {currency, userProfile} = useContext(ShopContext);
    
    // Backward compatibility: price might be undefined for new products
    const displayPrice = price;

  return (
    <Link onClick={()=>scrollTo(0,0)} className='text-gray-700 cursor-pointer group block bg-white rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-xl hover:border-red-500 hover:-translate-y-1 transition-all duration-300' to={`/product/${id}`}>
      <div className='overflow-hidden relative'>
        <img className='w-full transition-all duration-300 group-hover:brightness-105' src={image[0]} alt="" />
        <div className='absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
      </div>
      <div className='p-3'>
      <p className='pb-1 text-sm font-medium'>{name}</p>
      <div>
        {wholesalePrice && userProfile?.role === 'wholesale' && userProfile?.isApproved ? (
          <div className='text-sm'>
            <p className='font-medium text-green-700'>{currency}{wholesalePrice} <span className='text-xs text-gray-500'>(Wholesale)</span></p>
            <p className='text-xs text-gray-500 line-through'>{currency}{displayPrice}</p>
            <p className='text-xs text-gray-600'>Min qty: {minimumWholesaleQuantity || 10}</p>
          </div>
        ) : displayPrice ? (
          <p className='text-sm font-medium'>{currency}{displayPrice}</p>
        ) : null}
      </div>
      {stock === 0 ? (
        <p className='text-red-600 text-xs font-semibold mt-1'>Out of Stock</p>
      ) : stock && stock < 20 ? (
        <p className='text-orange-500 text-xs font-semibold mt-1'>Only {stock} left!</p>
      ) : null}
      </div>
    </Link>
  )
}

export default ProductItem
