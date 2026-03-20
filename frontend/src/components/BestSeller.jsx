import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import ProductItem from './ProductItem';

const BestSeller = () => {

    const { products, navigate } = useContext(ShopContext);
    const [activeTab, setActiveTab] = useState('latest');
    const [latestProducts, setLatestProducts] = useState([]);
    const [bestSellerProducts, setBestSellerProducts] = useState([]);

    useEffect(() => {
        // Latest products - first 8
        setLatestProducts(products.slice(0, 8));
        
        // Bestseller products - filtered and first 8
        const bestProduct = products.filter((item) => (item.bestseller));
        setBestSellerProducts(bestProduct.slice(0, 8));
    }, [products])

    const displayProducts = activeTab === 'latest' ? latestProducts : bestSellerProducts;

  return (
    <section className='py-16 px-6 lg:px-8 bg-white'>
      <div className='w-full px-6 lg:px-8'>
        {/* Header with tabs */}
        <div className='flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12'>
          <div className='space-y-2'>
            <h2 className='text-4xl lg:text-5xl font-light text-neutral-900'>Featured Products</h2>
            <p className='text-neutral-600'>Curated selection of our finest lighting pieces</p>
          </div>
          
          {/* Tab Toggle */}
          <div className='inline-flex items-center bg-rose-50 rounded-full p-1'>
            <button 
              onClick={() => setActiveTab('latest')} 
              className={`px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${
                activeTab === 'latest' 
                  ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-sm' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Latest Arrivals
            </button>
            <button 
              onClick={() => setActiveTab('bestsellers')} 
              className={`px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${
                activeTab === 'bestsellers' 
                  ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-sm' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Bestsellers
            </button>
          </div>
        </div>

        {/* Product Grid using existing ProductItem */}
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'>
          {
            displayProducts.map((item, index) => (
              <ProductItem 
                key={index} 
                id={item._id} 
                name={item.name} 
                image={item.image} 
                price={item.retailPrice || item.price} 
                wholesalePrice={item.wholesalePrice} 
                minimumWholesaleQuantity={item.minimumWholesaleQuantity} 
                stock={item.stock} 
              />
            ))
          }
        </div>

        {/* View All Button */}
        <div className='text-center'>
          <button 
            onClick={() => navigate('/collection')}
            className='inline-flex items-center gap-2 px-8 py-4 bg-rose-50 text-rose-700 text-sm font-medium rounded-full border border-rose-200 hover:border-rose-300 hover:bg-rose-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5'
          >
            View All Products
            <i className='ri-arrow-right-line'></i>
          </button>
        </div>
      </div>
    </section>
  )
}

export default BestSeller
