import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem'

const RecentlyViewed = () => {
  const { products } = useContext(ShopContext)
  const [recentlyViewed, setRecentlyViewed] = useState([])

  useEffect(() => {
    // Get recently viewed product IDs from localStorage
    const viewedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
    
    // Filter products that match the viewed IDs, maintaining the order
    const viewedProducts = viewedIds
      .map(id => products.find(product => product._id === id))
      .filter(Boolean) // Remove any null/undefined values
      .slice(0, 8) // Limit to 8 products
    
    setRecentlyViewed(viewedProducts)
  }, [products])

  // Don't render if no recently viewed products
  if (recentlyViewed.length === 0) {
    return null
  }

  return (
    <div className='bg-white py-16'>
      <div className='px-4 sm:px-6 md:px-8'>
        <div className='text-center text-3xl py-8'>
          <Title text1={'RECENTLY'} text2={'VIEWED'} />
          <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
            Continue exploring products you've recently checked out
          </p>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
          {recentlyViewed.map((item) => (
            <ProductItem 
              key={item._id} 
              id={item._id} 
              name={item.name} 
              price={item.retailPrice || item.price} 
              wholesalePrice={item.wholesalePrice}
              minimumWholesaleQuantity={item.minimumWholesaleQuantity}
              image={item.image}
              stock={item.stock}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default RecentlyViewed
