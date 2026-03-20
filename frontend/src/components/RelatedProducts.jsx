import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const RelatedProducts = ({category,subCategory,currentProductId}) => {

    const { products } = useContext(ShopContext);
    const [related,setRelated] = useState([]);

    useEffect(()=>{

        if (products.length > 0) {
            
            let productsCopy = products.slice();
            
            // First priority: Same subcategory (excluding current product)
            let sameSubCategory = productsCopy.filter((item) => 
                category === item.category && 
                subCategory === item.subCategory &&
                item._id !== currentProductId
            );
            
            // If we have 5 or more from same subcategory, use those
            if (sameSubCategory.length >= 5) {
                setRelated(sameSubCategory.slice(0, 5));
            } else {
                // Fill remaining with same category products
                let sameCategory = productsCopy.filter((item) => 
                    category === item.category &&
                    item._id !== currentProductId &&
                    !sameSubCategory.includes(item) // Don't duplicate
                );
                
                // Combine: subcategory first, then category
                let combined = [...sameSubCategory, ...sameCategory];
                setRelated(combined.slice(0, 5));
            }
        }
        
    },[products, currentProductId, category, subCategory])

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
          {related.map((item, index) => (
            <ProductItem
              key={index}
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
      ) : (
        <p className='text-neutral-500 text-sm'>No related products found</p>
      )}
    </div>
  )
}

export default RelatedProducts
