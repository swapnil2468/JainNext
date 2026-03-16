import React, { useContext, useEffect, useState, useRef } from 'react'
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
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const zoomFrameRef = useRef(null);

  const handleImageMouseMove = (e) => {
    // Capture values before callback
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    // Cancel previous frame if it exists
    if (zoomFrameRef.current) {
      cancelAnimationFrame(zoomFrameRef.current);
    }

    // Schedule new update on next animation frame
    zoomFrameRef.current = requestAnimationFrame(() => {
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      setZoomPos({ x, y });
      setIsZooming(true);
    });
  };

  const handleImageMouseLeave = () => {
    if (zoomFrameRef.current) {
      cancelAnimationFrame(zoomFrameRef.current);
    }
    setIsZooming(false);
  };

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
      
      {/*----------- NEW PRODUCT LAYOUT: Image Left (~55%) + Details Right (~45%) -------------- */}
      <div className='flex gap-8 sm:gap-12 flex-col lg:flex-row'>

        {/*---------- LEFT: Product Images Section (Thumbnails + Main Image) ------------- */}
        <div className='w-full lg:w-[55%] flex gap-3'>
          {/* Thumbnail Strip - Vertical on left side */}
          <div className='flex flex-col gap-2 overflow-y-auto'>
            {productData.image.map((item, index) => (
              <img 
                onClick={() => setImage(item)} 
                src={item} 
                key={index} 
                className={`w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0 cursor-pointer border-2 rounded-lg transition-all duration-300 object-cover ${
                  image === item 
                    ? 'border-red-700 shadow-md' 
                    : 'border-gray-200 hover:border-red-700'
                }`} 
                alt="" 
              />
            ))}
          </div>

          {/* Main Image */}
          <div 
            className='flex-1 overflow-hidden bg-gray-50 rounded-lg shadow-sm cursor-zoom-in relative'
            onMouseMove={handleImageMouseMove}
            onMouseLeave={handleImageMouseLeave}
          >
            <img 
              className={`w-full h-auto min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] object-contain transition-transform duration-150 ease-out p-4 ${
                isZooming ? 'scale-150' : 'scale-100'
              }`}
              style={{
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
              }}
              src={image} 
              alt="" 
            />
          </div>
        </div>

        {/* -------- RIGHT: Product Details Panel (~45% width) ---------- */}
        <div className='w-full lg:w-[45%] flex flex-col'>
          
          {/* Product Title */}
          <h1 className='font-semibold text-2xl sm:text-3xl mb-2'>{productData.name}</h1>
          
          {/* Brand Name */}
          {productData.specifications?.brand && (
            <p className='text-sm text-gray-700 font-medium mb-3'>{productData.specifications.brand}</p>
          )}

          {/* Ratings */}
          <div className='flex items-center gap-1 mb-4'>
            {Array.from({ length: 5 }).map((_, i) => {
              const filled = i < Math.floor(reviewStats.avgRating);
              const half   = !filled && i < reviewStats.avgRating;
              return filled
                ? <img key={i} src={assets.star_icon}      alt='' className='w-4' />
                : <img key={i} src={assets.star_dull_icon} alt='' className='w-4' />;
            })}
            {reviewStats.totalReviews > 0 ? (
              <p className='pl-2 text-sm text-gray-500'>({reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'review' : 'reviews'})</p>
            ) : (
              <p className='pl-2 text-sm text-gray-400'>No reviews yet</p>
            )}
          </div>

          {/* Pricing Section */}
          <div className='mb-5'>
            {userProfile?.role === 'wholesale' && userProfile?.isApproved && productData.wholesalePrice ? (
              <div>
                <div className='flex items-center gap-2 mb-2'>
                  <p className='text-2xl sm:text-3xl font-semibold text-green-700'>{currency}{productData.wholesalePrice}</p>
                  <span className='bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold'>Wholesale</span>
                </div>
                <div className='flex items-center gap-2'>
                  {productData.compareAtPrice && (
                    <p className='text-sm text-gray-400 line-through'>{currency}{productData.compareAtPrice}</p>
                  )}
                  <p className='text-sm text-gray-400 line-through'>{currency}{displayRetailPrice}</p>
                </div>
                <p className='text-sm text-gray-600 mt-2'>Minimum quantity: {productData.minimumWholesaleQuantity || 10} units</p>
                {quantity >= (productData.minimumWholesaleQuantity || 10) ? (
                  <p className='text-xs text-green-600 font-medium mt-1'>✔ Wholesale price applied</p>
                ) : (
                  <p className='text-xs text-red-600 font-medium mt-1'>⚠️ Add {(productData.minimumWholesaleQuantity || 10) - quantity} more to qualify</p>
                )}
              </div>
            ) : userProfile?.role === 'wholesale' && !userProfile?.isApproved ? (
              <div>
                <p className='text-2xl sm:text-3xl font-semibold'>{currency}{displayRetailPrice}</p>
                <div className='mt-2 p-2 bg-gray-50 border border-gray-200 rounded'>
                  <p className='text-xs text-gray-700'><strong>Your wholesale account is under review.</strong></p>
                  <p className='text-xs text-gray-600 mt-0.5'>You'll see wholesale pricing once approved.</p>
                </div>
              </div>
            ) : (
              <div>
                <div className='flex items-center gap-2'>
                  <p className='text-2xl sm:text-3xl font-semibold'>{currency}{displayRetailPrice}</p>
                  {productData.compareAtPrice && (
                    <p className='text-sm text-gray-400 line-through'>{currency}{productData.compareAtPrice}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Stock Status */}
          {productData.stock === 0 && (
            <p className='text-red-600 font-semibold text-base mb-3'>Out of Stock</p>
          )}
          {productData.stock && productData.stock < 20 && productData.stock > 0 && (
            <p className='text-red-600 font-semibold text-base mb-3'>⚠️ Hurry! Only {productData.stock} left in stock</p>
          )}

          {/* Specifications as Bullet List with Em-Dash */}
          {productData.specifications && Object.keys(productData.specifications).length > 0 && (
            <div className='mb-6 pb-6 border-b'>
              <h3 className='font-semibold text-gray-800 mb-3 text-sm'>Key Specifications:</h3>
              <ul className='space-y-2'>
                {Object.entries(productData.specifications).map(([key, value]) => (
                  value && (
                    <li key={key} className='text-base text-gray-700 flex items-start'>
                      <span className='mr-3 text-red-700 font-bold'>—</span>
                      <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {value}</span>
                    </li>
                  )
                ))}
              </ul>
            </div>
          )}

          {/* Quantity + Buttons Section */}
          <div className='mb-4'>
            {productData.stock === 0 ? (
              <button 
                disabled
                className='w-full bg-gray-400 text-white px-8 py-3 text-sm font-medium rounded-lg shadow-md cursor-not-allowed'
              >
                OUT OF STOCK
              </button>
            ) : !isInCart ? (
              <div className='flex gap-3'>
                <button 
                  onClick={() => {
                    addToCart(productData._id)
                    setIsInCart(true)
                  }} 
                  className='flex-1 bg-red-700 hover:bg-red-600 text-white px-8 py-3 text-sm font-medium rounded-lg transition-all duration-300 active:scale-95 shadow-md hover:shadow-lg'
                >
                  ADD TO CART
                </button>
                <button 
                  onClick={() => navigate('/cart')}
                  className='flex-1 border-2 border-red-700 text-red-700 hover:bg-red-50 px-8 py-3 text-sm font-medium rounded-lg transition-all duration-300 active:scale-95'
                >
                  BUY NOW
                </button>
              </div>
            ) : (
              <div className='flex gap-3'>
                <div className='flex items-center border-2 border-red-200 rounded-lg overflow-hidden hover:border-red-300 transition-colors duration-200 flex-1'>
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
                    className='px-4 py-2 text-base hover:bg-red-50 transition-colors duration-200'
                  >
                    −
                  </button>
                  <p className='px-4 py-2 border-l border-r border-red-200 text-center flex-1'>{quantity}</p>
                  <button 
                    onClick={() => {
                      const newQuantity = quantity + 1;
                      if (newQuantity <= 999) {
                        setQuantity(newQuantity);
                        updateQuantity(productData._id, newQuantity);
                      }
                    }}
                    disabled={quantity >= 999}
                    className={`px-4 py-2 text-base transition-colors duration-200 ${
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
                  className='flex-1 bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-sm font-medium rounded-lg transition-all duration-300 active:scale-95 shadow-md hover:shadow-lg'
                >
                  BUY NOW
                </button>
              </div>
            )}
          </div>

          {/* Two Column Section: Offers + Delivery */}
          <div className='grid grid-cols-2 gap-6 pb-6'>
            {/* Offers Column */}
            <div>
              <h3 className='font-semibold text-gray-800 mb-3 text-sm'>Offers Available</h3>
              <ul className='space-y-2 text-sm text-gray-700'>
                <li className='flex items-start gap-2'>
                  <span className='text-green-600 mt-0.5'>✓</span>
                  <span>Free shipping above ₹99</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-green-600 mt-0.5'>✓</span>
                  <span>Cash on delivery available</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-green-600 mt-0.5'>✓</span>
                  <span>7 day return & exchange policy</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-green-600 mt-0.5'>✓</span>
                  <span>100% original product guaranteed</span>
                </li>
              </ul>
            </div>

            {/* Delivery Column */}
            <div>
              <h3 className='font-semibold text-gray-800 mb-3 text-sm'>Delivery</h3>
              <div className='text-sm text-gray-700 space-y-2'>
                <p>✓ Available for all locations</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ---------- Tabs Section (Description + Use Cases) ------------- */}
      <div className='mt-20'>
        <div className='flex gap-0 border-b'>
          <button
            onClick={() => setActiveTab('description')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
              activeTab === 'description' 
                ? 'border-red-700 text-red-700 bg-gray-50' 
                : 'border-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            Description
          </button>
          {productData.useCases && (
            <button
              onClick={() => setActiveTab('use-cases')}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'use-cases' 
                  ? 'border-red-700 text-red-700 bg-gray-50' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50'
              }`}
            >
              Use Cases
            </button>
          )}
        </div>
        
        <div className='border border-t-0 px-6 py-6 bg-white'>
          {activeTab === 'description' && (
            <p className='text-gray-600 leading-relaxed'>{productData.description}</p>
          )}
          {activeTab === 'use-cases' && productData.useCases && (
            <div className='text-gray-600 whitespace-pre-line leading-relaxed'>{productData.useCases}</div>
          )}
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