import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';

import RelatedProducts from '../components/RelatedProducts';
import SpecificationTable from '../components/SpecificationTable';
import ReviewSection from '../components/ReviewSection';
import RecentlyViewed from '../components/RecentlyViewed';

const Product = () => {

  const { productId } = useParams();
  const { products, currency ,addToCart, navigate, cartItems, updateQuantity, token, userProfile, getProductPrice, canUseWholesalePrice, backendUrl } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('')
  const [quantity, setQuantity] = useState(1);
  const [isInCart, setIsInCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewStats, setReviewStats] = useState({ avgRating: 0, totalReviews: 0 });

  const fetchProductData = async () => {
    const product = products.find((item) => item._id === productId);
    
    if (product) {
      setProductData(product);
      setImage(product.image[0]);
      // Fetch real review stats
      try {
        const res = await axios.post(backendUrl + '/api/review/stats', { productId })
        if (res.data.success) setReviewStats({ avgRating: res.data.avgRating, totalReviews: res.data.totalReviews })
      } catch (_) {}
    }
  }

  useEffect(() => {
    fetchProductData();
    
    // Track recently viewed products
    if (productId) {
      const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      
      // Remove productId if it already exists to avoid duplicates
      const updatedViewed = recentlyViewed.filter(id => id !== productId);
      
      // Add current product to the beginning of the array
      updatedViewed.unshift(productId);
      
      // Keep only the last 20 viewed products
      const limitedViewed = updatedViewed.slice(0, 20);
      
      localStorage.setItem('recentlyViewed', JSON.stringify(limitedViewed));
    }
  }, [productId,products])

  useEffect(() => {
    if (cartItems && cartItems[productId]) {
      setIsInCart(true);
      setQuantity(cartItems[productId]);
    } else {
      setIsInCart(false);
      setQuantity(1);
    }
  }, [cartItems, productId])

  // Show loading state if products aren't loaded yet or product not found
  if (!products || products.length === 0) {
    return (
      <div className='border-t-2 pt-10 flex items-center justify-center min-h-[60vh]'>
        <p className='text-lg text-gray-500'>Loading...</p>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className='border-t-2 pt-10 flex items-center justify-center min-h-[60vh]'>
        <div className='text-center'>
          <p className='text-lg text-gray-500 mb-4'>Product not found</p>
          <button 
            onClick={() => navigate('/collection')}
            className='bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700'
          >
            Back to Collection
          </button>
        </div>
      </div>
    );
  }

  // Get display price (backward compatible with old 'price' field)
  const displayRetailPrice = productData.retailPrice || productData.price;

  return (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      
      {/*----------- Product Data-------------- */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

        {/*---------- Product Images------------- */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
              {
                productData.image.map((item,index)=>(
                  <img onClick={()=>setImage(item)} src={item} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer border-4 border-transparent hover:border-red-700 rounded-lg transition-all duration-300' alt="" />
                ))
              }
          </div>
          <div className='w-full sm:w-[80%] overflow-hidden'>
              <img className='w-full h-auto transition-transform duration-500 ease-out hover:scale-110' src={image} alt="" />
          </div>
        </div>

        {/* -------- Product Info ---------- */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          <div className='flex items-center gap-1 mt-2'>
            {Array.from({ length: 5 }).map((_, i) => {
              const filled = i < Math.floor(reviewStats.avgRating);
              const half   = !filled && i < reviewStats.avgRating;
              return filled
                ? <img key={i} src={assets.star_icon}      alt='' className='w-3.5' />
                : <img key={i} src={assets.star_dull_icon} alt='' className='w-3.5' />;
            })}
            {reviewStats.totalReviews > 0 ? (
              <p className='pl-2 text-sm text-gray-500'>({reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'review' : 'reviews'})</p>
            ) : (
              <p className='pl-2 text-sm text-gray-400'>No reviews yet</p>
            )}
          </div>

          {/* Pricing Section */}
          <div className='mt-5'>
            {userProfile?.role === 'wholesale' && userProfile?.isApproved && productData.wholesalePrice ? (
              <div>
                <div className='flex items-center gap-4'>
                  <p className='text-3xl font-bold text-green-700'>{currency}{productData.wholesalePrice}</p>
                  <span className='bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium'>Wholesale Price</span>
                </div>
                <p className='text-lg text-gray-500 line-through mt-1'>{currency}{displayRetailPrice}</p>
                <p className='text-sm text-gray-600 mt-2'>Minimum quantity: {productData.minimumWholesaleQuantity || 10} units</p>
                {quantity >= (productData.minimumWholesaleQuantity || 10) ? (
                  <p className='text-xs text-green-600 font-medium mt-1'>✔ Wholesale price applied</p>
                ) : (
                  <p className='text-xs text-orange-600 font-medium mt-1'>⚠️ Add {(productData.minimumWholesaleQuantity || 10) - quantity} more to qualify for wholesale price</p>
                )}
              </div>
            ) : userProfile?.role === 'wholesale' && !userProfile?.isApproved ? (
              <div>
                <p className='text-3xl font-medium'>{currency}{displayRetailPrice}</p>
                <div className='mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg'>
                  <p className='text-sm text-orange-800'><strong>Your wholesale account is under review.</strong></p>
                  <p className='text-xs text-orange-600 mt-1'>You'll see wholesale pricing once approved.</p>
                </div>
              </div>
            ) : (
              <p className='text-3xl font-medium'>{currency}{displayRetailPrice}</p>
            )}
          </div>

          {/* Stock Status Display */}
          <div className='mt-4'>
            {productData.stock === 0 ? (
              <p className='text-red-600 font-semibold text-lg'>Out of Stock</p>
            ) : productData.stock && productData.stock < 20 ? (
              <p className='text-orange-500 font-semibold text-lg'>⚠️ Hurry! Only {productData.stock} left in stock</p>
            ) : null}
          </div>

          {/* -------- Specifications Section (Added Under Price) -------- */}
          <div className='mt-8'>
            <h2 className='text-lg font-semibold mb-4 text-red-900'>Specifications</h2>
            {productData.specifications && Object.keys(productData.specifications).length > 0 ? (
              <SpecificationTable specifications={productData.specifications} />
            ) : (
              <p className='text-gray-500 text-sm'>No specifications available for this product.</p>
            )}
          </div>
          
          {/* Dynamic Add to Cart Section */}
          {productData.stock === 0 ? (
            <button 
              disabled
              className='bg-gray-400 text-white px-8 py-3 text-sm font-medium rounded-lg mt-8 shadow-md cursor-not-allowed'
            >
              OUT OF STOCK
            </button>
          ) : !isInCart ? (
            <button 
              onClick={() => {
                addToCart(productData._id)
                setIsInCart(true)
              }} 
              className='bg-red-700 hover:bg-red-600 text-white px-8 py-3 text-sm font-medium rounded-lg transition-all duration-300 active:scale-95 mt-8 shadow-md hover:shadow-lg'
            >
              ADD TO CART
            </button>
          ) : (
            <div className='mt-8 flex gap-4 items-center'>
              <div className='flex items-center border-2 border-red-200 rounded-lg overflow-hidden hover:border-red-300 transition-colors duration-200'>
                <button 
                  onClick={() => {
                    if (quantity > 1) {
                      const newQuantity = quantity - 1;
                      setQuantity(newQuantity);
                      updateQuantity(productData._id, newQuantity);
                    } else if (quantity === 1) {
                      setQuantity(0);
                      updateQuantity(productData._id, 0);
                      setIsInCart(false);
                    }
                  }}
                  className='px-4 py-2 text-lg hover:bg-red-50 transition-colors duration-200'
                >
                  −
                </button>
                <p className='px-4 py-2 border-l border-r border-red-200 text-center w-16'>{quantity}</p>
                <button 
                  onClick={() => {
                    const newQuantity = quantity + 1;
                    if (newQuantity <= 999) {
                      setQuantity(newQuantity);
                      updateQuantity(productData._id, newQuantity);
                    }
                  }}
                  disabled={quantity >= 999}
                  className={`px-4 py-2 text-lg transition-colors duration-200 ${
                    quantity >= 999 
                      ? 'cursor-not-allowed opacity-40 bg-gray-100' 
                      : 'hover:bg-red-50 cursor-pointer'
                  }`}
                >
                  +
                </button>
              </div>
              <button 
                onClick={() => navigate('/cart')}
                className='bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-sm font-medium rounded-lg transition-all duration-300 active:scale-95 shadow-md hover:shadow-lg'
              >
                BUY NOW
              </button>
            </div>
          )}
          
          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
              <p>100% Original product.</p>
              <p>Cash on delivery is available on this product.</p>
              <p>Easy return and exchange policy within 7 days.</p>
          </div>

          {/* Social Sharing Section */}
          <div className='mt-8 sm:w-4/5'>
            <p className='text-sm font-medium text-gray-800 mb-3'>Share this product:</p>
            <div className='flex gap-3 items-center'>
              {/* WhatsApp Share */}
              <button
                onClick={() => {
                  const url = window.location.href;
                  const text = `Check out this product: ${productData.name}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                }}
                className='flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg active:scale-95'
                title='Share on WhatsApp'
              >
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z'/>
                </svg>
                WhatsApp
              </button>

              {/* Facebook Share */}
              <button
                onClick={() => {
                  const url = window.location.href;
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                }}
                className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg active:scale-95'
                title='Share on Facebook'
              >
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'/>
                </svg>
                Facebook
              </button>

              {/* Twitter/X Share */}
              <button
                onClick={() => {
                  const url = window.location.href;
                  const text = `Check out this product: ${productData.name}`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                }}
                className='flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg active:scale-95'
                title='Share on Twitter/X'
              >
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/>
                </svg>
                Twitter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Description Tab (RESTORED EXACTLY AS BEFORE) ------------- */}
      <div className='mt-20'>
        <div className='flex gap-0'>
          <button
            className='px-5 py-3 text-sm font-medium border border-b-0 bg-gray-100 text-black hover:bg-gray-200 transition-colors duration-200'
          >
            Description
          </button>
        </div>
        
        <div className='border border-t-0 px-6 py-6'>
          <p className='text-gray-500'>{productData.description}</p>
        </div>
      </div>

      {/* --------- Review Section ---------- */}
      <ReviewSection productId={productId} token={token} onReviewChange={fetchProductData} />

      {/* --------- display related products ---------- */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} currentProductId={productData._id} />

      {/* --------- display recently viewed products ---------- */}
      <RecentlyViewed />

    </div>
  )
}

export default Product