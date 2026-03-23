import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem'

const RecentlyViewed = ({ excludeProductId }) => {
  const { products } = useContext(ShopContext)
  const [recentlyViewed, setRecentlyViewed] = useState([])

  useEffect(() => {
    // Get recently viewed product IDs from localStorage
    const viewedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
    
    // Filter products that match the viewed IDs, maintaining the order, excluding current product
    const viewedProducts = viewedIds
      .map(id => products.find(product => product._id === id))
      .filter(product => product && product._id !== excludeProductId) // Remove any null/undefined values and current product
      .slice(0, 8) // Limit to 8 products
    
    setRecentlyViewed(viewedProducts)
  }, [products, excludeProductId])

  // Don't render if no recently viewed products
  if (recentlyViewed.length === 0) {
    return null
  }

  return (
    <div className='my-16'>
      {/* Section Header */}
      <div className='flex items-center gap-4 mb-8'>
        <h2 className='text-2xl md:text-3xl font-light text-neutral-900'>
          Recently <span className='text-rose-600 font-medium'>Viewed</span>
        </h2>
        <div className='flex-1 h-px bg-neutral-200'></div>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {recentlyViewed.map((item) => {
          const firstVariant = item.variants && item.variants.length > 0 ? item.variants[0] : null
          const displayImage = firstVariant?.images?.length > 0 ? firstVariant.images : item.image
          const displayPrice = firstVariant?.price || item.retailPrice || item.price
          const displayStock = firstVariant
            ? item.variants.reduce((total, v) => total + (v.stock || 0), 0)
            : item.stock
          const displayWholesalePrice = firstVariant?.wholesalePrice || item.wholesalePrice

          return (
            <ProductItem
              key={item._id}
              id={item._id}
              slug={item.slug}
              name={item.name}
              price={displayPrice}
              wholesalePrice={displayWholesalePrice}
              minimumWholesaleQuantity={item.minimumWholesaleQuantity}
              image={displayImage}
              stock={displayStock}
            />
          )
        })}
      </div>
    </div>
  )
}

export default RecentlyViewed
