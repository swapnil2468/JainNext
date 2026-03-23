import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const RelatedProducts = ({category, currentProductId}) => {

    const { products } = useContext(ShopContext);
    const [related,setRelated] = useState([]);

    useEffect(()=>{

        if (products.length > 0) {
            
            let productsCopy = products.slice();
            
            // Get products from same category (excluding current product)
            let sameCategory = productsCopy.filter((item) => 
                category === item.category &&
                item._id !== currentProductId
            );
            
            setRelated(sameCategory.slice(0, 5));
        }
        
    },[products, currentProductId, category])

  return (
    <div className='my-16'>
      {/* Section Header */}
      <div className='flex items-center gap-4 mb-8'>
        <h2 className='text-2xl md:text-3xl font-light text-neutral-900'>
          Related <span className='text-rose-600 font-medium'>Products</span>
        </h2>
        <div className='flex-1 h-px bg-neutral-200'></div>
      </div>

      {related.length > 0 ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
          {related.map((item, index) => {
            const firstVariant = item.variants && item.variants.length > 0 ? item.variants[0] : null
            const displayImage = firstVariant?.images?.length > 0 ? firstVariant.images : item.image
            const displayPrice = firstVariant?.price || item.retailPrice || item.price
            const displayStock = firstVariant
              ? item.variants.reduce((total, v) => total + (v.stock || 0), 0)
              : item.stock
            const displayWholesalePrice = firstVariant?.wholesalePrice || item.wholesalePrice

            return (
              <ProductItem
                key={index}
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
      ) : (
        <p className='text-neutral-500 text-sm'>No related products found</p>
      )}
    </div>
  )
}

export default RelatedProducts
