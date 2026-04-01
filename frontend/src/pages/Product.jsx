import React, { useContext, useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';

import RelatedProducts from '../components/RelatedProducts';
import SpecificationTable from '../components/SpecificationTable';
import ReviewSection from '../components/ReviewSection';
import RecentlyViewed from '../components/RecentlyViewed';

// API endpoints
const API_ENDPOINTS = {
  REVIEW_STATS: '/api/review/stats'
};

// localStorage keys
const STORAGE_KEYS = {
  RECENTLY_VIEWED: 'recentlyViewed'
};

// Limits
const LIMITS = {
  MAX_RECENTLY_VIEWED: 20
};

const Product = () => {

  const { slug } = useParams();
  const { products, currency ,addToCart, navigate, cartItems, updateQuantity, token, userProfile, getProductPrice, canUseWholesalePrice, backendUrl } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [productId, setProductId] = useState(null); // Store the actual MongoDB _id
  const [image, setImage] = useState('')
  const [quantity, setQuantity] = useState(1);
  const [isInCart, setIsInCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewStats, setReviewStats] = useState({ avgRating: 0, totalReviews: 0 });
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState({});
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
    const product = products.find((item) => item.slug === slug || item._id === slug);
    
    if (product) {
      setProductId(product._id); // Store the actual MongoDB _id
      setProductData(product);
      setImage(product.image[0]);
      
      if (product.variants && product.variants.length > 0 && product.variantTypes && product.variantTypes.length > 0) {
        // Initialize selected attributes with FIRST VARIANT DATA (complete set)
        const firstVariant = product.variants[0]
        const initialAttributes = {}
        
        // Set ALL attributes from the first variant to ensure we have a complete match
        product.variantTypes.forEach(type => {
          if (type === 'color') {
            initialAttributes.color = firstVariant.color || firstVariant.attributes?.color
          } else if (firstVariant.attributes?.[type]) {
            initialAttributes[type] = firstVariant.attributes[type]
          }
        })
        
        setSelectedAttributes(initialAttributes)
        
        // Set image from first variant images, not product images
        const variantImage = firstVariant.images?.[0]
        setImage(variantImage || product.image[0])
      } else {
        setSelectedAttributes({})
      }
      
      // Fetch real review stats
      try {
        const res = await axios.post(backendUrl + API_ENDPOINTS.REVIEW_STATS, { productId })
        if (res.data.success) setReviewStats({ avgRating: res.data.avgRating, totalReviews: res.data.totalReviews })
      } catch (_) {}
    }
  }

  useEffect(() => {
    const loadProduct = async () => {
      await fetchProductData()
    }
    loadProduct()
  }, [slug, products])

  // Separate useEffect for recently viewed - runs after productData is set
  useEffect(() => {
    if (!productData?._id) return
    const recentlyViewed = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENTLY_VIEWED) || '[]')
    const updatedViewed = recentlyViewed.filter(id => id !== productData._id)
    updatedViewed.unshift(productData._id)
    const limitedViewed = updatedViewed.slice(0, LIMITS.MAX_RECENTLY_VIEWED)
    localStorage.setItem(STORAGE_KEYS.RECENTLY_VIEWED, JSON.stringify(limitedViewed))
  }, [productData?._id])

  // One-time cleanup: clear old slug-based recently viewed data
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENTLY_VIEWED) || '[]')
    // If stored values look like slugs (contain hyphens, no 24-char hex), clear them
    const hasOldFormat = stored.some(id => id.includes('-') && !/^[a-f\d]{24}$/i.test(id))
    if (hasOldFormat) {
      localStorage.removeItem(STORAGE_KEYS.RECENTLY_VIEWED)
    }
  }, [])

  useEffect(() => {
    if (!cartItems || !productData) return

    const hasVariants = productData?.variants && productData.variants.length > 0 && productData.variantTypes?.length > 0

    if (hasVariants && Object.keys(selectedAttributes).length > 0) {
      // Generate cart key from selected attributes
      const attrStrings = Object.entries(selectedAttributes)
        .map(([type, value]) => `${type}:${value}`)
        .join('::')
      const cartKey = `${productId}__${attrStrings}`
      const cartQty = cartItems[cartKey]
      if (cartQty > 0) {
        setIsInCart(true)
        setQuantity(cartQty)
      } else {
        setIsInCart(false)
        setQuantity(1)
      }
    } else if (!hasVariants) {
      const cartQty = cartItems[productId]
      if (cartQty > 0) {
        setIsInCart(true)
        setQuantity(cartQty)
      } else {
        setIsInCart(false)
        setQuantity(1)
      }
    }
  }, [cartItems, productId, selectedAttributes, productData])

  // Update main image when variant attributes change
  useEffect(() => {
    if (!productData || !productData.variants) return
    
    const hasVariants = productData.variants && productData.variants.length > 0 && productData.variantTypes?.length > 0
    
    if (hasVariants && Object.keys(selectedAttributes).length > 0) {
      // Find matching variant based on selected attributes
      const matchingVariant = productData.variants.find(variant => {
        for (const type of productData.variantTypes) {
          const selectedValue = selectedAttributes[type]
          if (!selectedValue) return false
          
          if (type === 'color') {
            const variantColor = variant.color || variant.attributes?.color
            if (variantColor !== selectedValue) return false
          } else {
            if (variant.attributes?.[type] !== selectedValue) return false
          }
        }
        return true
      })
      
      // Set image to first image of the matched variant
      if (matchingVariant?.images?.length > 0) {
        setImage(matchingVariant.images[0])
      }
    }
  }, [selectedAttributes, productData])

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
            className='bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700'
          >
            Back to Collection
          </button>
        </div>
      </div>
    );
  }

  // Get display price (backward compatible with old 'price' field)
  const hasVariants = productData.variants && productData.variants.length > 0 && productData.variantTypes?.length > 0
  
  // Find matching variant based on selected attributes
  const findSelectedVariant = () => {
    if (!hasVariants || Object.keys(selectedAttributes).length === 0) return null
    
    return productData.variants.find(variant => {
      // Check ALL variant types match
      for (const type of productData.variantTypes) {
        const selectedValue = selectedAttributes[type]
        if (!selectedValue) return false // Must have all attributes selected
        
        if (type === 'color') {
          const variantColor = variant.color || variant.attributes?.color
          if (variantColor !== selectedValue) return false
        } else {
          if (variant.attributes?.[type] !== selectedValue) return false
        }
      }
      return true
    })
  }
  
  const selectedVariant = findSelectedVariant()
  
  const displayImages = hasVariants && selectedVariant?.images?.length > 0
    ? selectedVariant.images
    : productData.image
  const displayPrice = hasVariants && selectedVariant?.price
    ? selectedVariant.price
    : (productData.retailPrice || productData.price)
  // Hide compare at price for wholesale users
  const displayCompareAtPrice = userProfile?.role === 'wholesale' && userProfile?.isApproved
    ? null
    : (hasVariants && selectedVariant?.compareAtPrice
      ? selectedVariant.compareAtPrice
      : productData.compareAtPrice)
  const displayStock = hasVariants && selectedVariant
    ? selectedVariant.stock
    : productData.stock
  const displayWholesalePrice = hasVariants && selectedVariant?.wholesalePrice
    ? selectedVariant.wholesalePrice
    : productData.wholesalePrice

  return (
    <div className='min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 pt-24 px-6 lg:px-8'>
      
      {/* Breadcrumb Navigation */}
      <div className='pb-6'>
        <div className='flex items-center gap-2 text-sm text-neutral-600'>
          <button onClick={() => navigate('/')} className='hover:text-rose-600 transition-colors'>Home</button>
          <i className='ri-arrow-right-s-line text-neutral-400'></i>
          <button onClick={() => navigate('/collection')} className='hover:text-rose-600 transition-colors'>Collection</button>
          <i className='ri-arrow-right-s-line text-neutral-400'></i>
          <span className='text-neutral-900 font-medium'>{productData.name}</span>
        </div>
      </div>
      
      {/*----------- NEW PRODUCT LAYOUT: Image Left (~55%) + Details Right (~45%) -------------- */}
      <div className='flex gap-8 sm:gap-12 flex-col lg:flex-row'>

        {/*---------- LEFT: Product Images Section (Thumbnails + Main Image) ------------- */}
        <div className='w-full lg:w-[55%] flex flex-col gap-3'>
          {/* Top part: thumbnails + main image side by side */}
          <div className='flex flex-col sm:flex-row gap-3'>
            {/* Thumbnail Strip - Hidden on mobile, vertical on sm+ */}
            <div className='hidden sm:flex flex-col gap-2 overflow-y-auto'>
              {displayImages.map((item, index) => (
                <img 
                  onClick={() => setImage(item)} 
                  src={item} 
                  key={index} 
                  className={`w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0 cursor-pointer border-2 rounded-lg transition-all duration-300 object-cover ${
                    image === item 
                      ? 'border-rose-600 shadow-md' 
                      : 'border-gray-200 hover:border-rose-600'
                  }`} 
                  alt="" 
                />
              ))}
            </div>

            {/* Main Image */}
            <div 
              className='flex-1 overflow-hidden bg-neutral-50 rounded-2xl border border-neutral-100 shadow-sm cursor-zoom-in relative min-h-[280px] sm:min-h-[400px]'
              onMouseMove={handleImageMouseMove}
              onMouseLeave={handleImageMouseLeave}
            >
              <img 
                className={`w-full h-full min-h-[280px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px] object-cover transition-transform duration-150 ease-out ${
                  isZooming ? 'scale-125' : 'scale-100'
                }`}
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                }}
                src={image} 
                alt="" 
              />
            </div>
          </div>

          {/* Feature badges below image */}
          <div className='grid grid-cols-3 gap-3'>
            <div className='flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-neutral-100'>
              <div className='w-8 h-8 bg-rose-50 rounded-full flex items-center justify-center'>
                <i className='ri-shield-check-line text-rose-600'></i>
              </div>
              <span className='text-xs text-neutral-600 text-center'>Quality Assured</span>
            </div>
            <div className='flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-neutral-100'>
              <div className='w-8 h-8 bg-rose-50 rounded-full flex items-center justify-center'>
                <i className='ri-truck-line text-rose-600'></i>
              </div>
              <span className='text-xs text-neutral-600 text-center'>Free Delivery</span>
            </div>
            <div className='flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-neutral-100'>
              <div className='w-8 h-8 bg-rose-50 rounded-full flex items-center justify-center'>
                <i className='ri-arrow-go-back-line text-rose-600'></i>
              </div>
              <span className='text-xs text-neutral-600 text-center'>Easy Returns</span>
            </div>
          </div>
        </div>

        {/* -------- RIGHT: Product Details Panel (~45% width) ---------- */}
        <div className='w-full lg:w-[45%] flex flex-col'>
          
          {/* Product Title */}
          <h1 className='text-3xl md:text-4xl font-light text-neutral-900 mb-3'>{productData.name}</h1>
          
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
            {userProfile?.role === 'wholesale' && userProfile?.isApproved && displayWholesalePrice ? (
              <div>
                <div className='flex items-center gap-2 mb-2'>
                  <p className='text-2xl sm:text-3xl font-semibold text-green-700'>{currency}{displayWholesalePrice}</p>
                  <span className='bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold'>Wholesale</span>
                </div>
                <div className='flex items-center gap-2'>
                  {displayCompareAtPrice && (
                    <p className='text-sm text-gray-400 line-through'>{currency}{displayCompareAtPrice}</p>
                  )}
                  <p className='text-sm text-gray-400 line-through'>{currency}{displayPrice}</p>
                </div>
                <p className='text-sm text-gray-600 mt-2'>Minimum quantity: {productData.minimumWholesaleQuantity || 10} units</p>
                {quantity >= (productData.minimumWholesaleQuantity || 10) ? (
                  <p className='text-xs text-green-600 font-medium mt-1'>✔ Wholesale price applied</p>
                ) : (
                  <p className='text-xs text-rose-600 font-medium mt-1'>⚠️ Add {(productData.minimumWholesaleQuantity || 10) - quantity} more to qualify</p>
                )}
              </div>
            ) : userProfile?.role === 'wholesale' && !userProfile?.isApproved ? (
              <div>
                <p className='text-2xl sm:text-3xl font-semibold'>{currency}{displayPrice}</p>
                <div className='mt-2 p-2 bg-gray-50 border border-gray-200 rounded'>
                  <p className='text-xs text-gray-700'><strong>Your wholesale account is under review.</strong></p>
                  <p className='text-xs text-gray-600 mt-0.5'>You'll see wholesale pricing once approved.</p>
                </div>
              </div>
            ) : (
              <div>
                <div className='flex items-baseline gap-3 flex-wrap'>
                  <span className='text-3xl font-bold text-neutral-900'>{currency}{displayPrice}</span>
                  {displayCompareAtPrice && (
                    <>
                      <span className='text-xl text-neutral-400 line-through'>{currency}{displayCompareAtPrice}</span>
                      <span className='px-2 py-1 bg-green-50 text-green-700 text-sm font-semibold rounded'>
                        {Math.round((1 - displayPrice / displayCompareAtPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Stock Status */}
          {displayStock === 0 && (
            <p className='text-rose-600 font-semibold text-base mb-3'>Out of Stock</p>
          )}
          {displayStock && displayStock < 20 && displayStock > 0 && (
            <p className='text-rose-600 font-semibold text-base mb-3'>⚠️ Hurry! Only {displayStock} left in stock</p>
          )}

          {/* Specifications as Bullet List with Em-Dash */}
          {productData.specifications && Object.keys(productData.specifications).length > 0 && (
            <div className='mb-6 pb-6 border-b'>
              <h3 className='font-semibold text-gray-800 mb-3 text-sm'>Key Specifications:</h3>
              <ul className='space-y-2'>
                {Object.entries(productData.specifications).map(([key, value]) => (
                  value && (
                    <li key={key} className='text-base text-gray-700 flex items-start'>
                      <span className='mr-3 text-rose-600 font-bold'>—</span>
                      <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {value}</span>
                    </li>
                  )
                ))}
              </ul>
            </div>
          )}

          {/* Quantity + Buttons Section */}
          <div className='mb-4 space-y-4'>
            {/* Variant Selectors - Color first, then filtered by color */}
            {hasVariants && productData.variantTypes && (
              <div className='mb-6 pb-6 border-b border-neutral-100'>
                {/* Helper function to get available options for a type based on selected color */}
                {(() => {
                  const getAvailableOptionsForType = (type) => {
                    if (type === 'color') {
                      // Show all colors - check both legacy and new format
                      return Array.from(new Set(
                        productData.variants
                          .map(v => v.color || v.attributes?.color)
                          .filter(Boolean)
                      ))
                    } else if (selectedAttributes.color) {
                      // Filter by selected color - check both legacy and new format
                      return Array.from(new Set(
                        productData.variants
                          .filter(v => (v.color === selectedAttributes.color || v.attributes?.color === selectedAttributes.color))
                          .map(v => v.attributes?.[type])
                          .filter(Boolean)
                      ))
                    } else {
                      // No color selected, show all options for this type
                      return Array.from(new Set(
                        productData.variants
                          .map(v => v.attributes?.[type])
                          .filter(Boolean)
                      ))
                    }
                  }

                  return productData.variantTypes.map((variantType) => (
                    <div key={variantType} className='mb-4 last:mb-0'>
                      <p className='text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-3'>
                        {variantType.charAt(0).toUpperCase() + variantType.slice(1)}:
                        <span className='font-normal normal-case text-rose-600 ml-2'>
                          {selectedAttributes[variantType] || 'Select'}
                        </span>
                      </p>
                      
                      {variantType === 'color' ? (
                        // Color selector with color swatches
                        <div className='flex flex-wrap gap-2'>
                          {getAvailableOptionsForType('color').map((colorValue) => {
                            const variant = productData.variants.find(v => (v.color === colorValue || v.attributes?.color === colorValue))
                            return (
                              <button
                                key={colorValue}
                                onClick={() => {
                                  // Find the first variant with this exact color
                                  const colorVariant = productData.variants.find(v => 
                                    (v.color === colorValue || v.attributes?.color === colorValue)
                                  )
                                  
                                  // Build complete attributes from the found variant
                                  const newAttributes = { color: colorValue }
                                  
                                  if (colorVariant) {
                                    // Extract length, size, material, etc. from the variant
                                    productData.variantTypes.forEach(type => {
                                      if (type !== 'color') {
                                        // Get the attribute value from variant.attributes
                                        const attrValue = colorVariant.attributes?.[type]
                                        if (attrValue !== undefined && attrValue !== null) {
                                          newAttributes[type] = attrValue
                                        }
                                      }
                                    })
                                  }
                                  
                                  setSelectedAttributes(newAttributes)
                                }}
                                disabled={variant?.stock === 0}
                                title={colorValue}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200 ${
                                  selectedAttributes.color === colorValue
                                    ? 'border-rose-600 bg-rose-50 text-rose-700'
                                    : 'border-neutral-200 text-neutral-600 hover:border-rose-300'
                                } ${variant?.stock === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                {variant?.colorCode && (
                                  <span
                                    className='w-5 h-5 rounded-full border border-neutral-200 shadow-sm flex-shrink-0'
                                    style={{ backgroundColor: variant.colorCode }}
                                  ></span>
                                )}
                                {colorValue}
                                {variant?.stock === 0 && <span className='text-xs'>(Out of Stock)</span>}
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        // Other variant types: button selector (same style as color)
                        <div className='flex flex-wrap gap-2'>
                          {getAvailableOptionsForType(variantType).map((value) => {
                            // Find if this combination is available in stock
                            const testAttributes = {...selectedAttributes, [variantType]: value}
                            const matchingVariant = productData.variants.find(v => {
                              for (const [type, val] of Object.entries(testAttributes)) {
                                const variantValue = type === 'color' ? (v.color || v.attributes?.color) : v.attributes?.[type]
                                if (variantValue !== val) return false
                              }
                              return true
                            })
                            
                            return (
                              <button
                                key={value}
                                onClick={() => {
                                  // Only update the clicked attribute, keep all other selected attributes unchanged
                                  // This prevents color from being reset when length is clicked
                                  const newAttributes = {...selectedAttributes, [variantType]: value}
                                  
                                  // Verify this combination actually exists in variants
                                  const combinationExists = productData.variants.some(v => {
                                    for (const [type, val] of Object.entries(newAttributes)) {
                                      const variantValue = type === 'color'
                                        ? (v.color || v.attributes?.color)
                                        : v.attributes?.[type]
                                      if (variantValue !== val) return false
                                    }
                                    return true
                                  })
                                  
                                  if (combinationExists) {
                                    // Exact combination exists - just update the attribute
                                    setSelectedAttributes(newAttributes)
                                  } else {
                                    // Combination does not exist - find closest match keeping the new value
                                    // but allowing other attributes to change
                                    const closestVariant = productData.variants.find(v => {
                                      const variantValue = variantType === 'color'
                                        ? (v.color || v.attributes?.color)
                                        : v.attributes?.[variantType]
                                      return variantValue === value
                                    })
                                    
                                    if (closestVariant) {
                                      const fallbackAttributes = {}
                                      productData.variantTypes.forEach(type => {
                                        if (type === variantType) {
                                          fallbackAttributes[type] = value
                                        } else if (type === 'color') {
                                          fallbackAttributes[type] = closestVariant.color || closestVariant.attributes?.color
                                        } else {
                                          fallbackAttributes[type] = closestVariant.attributes?.[type]
                                        }
                                      })
                                      setSelectedAttributes(fallbackAttributes)
                                    }
                                  }
                                }}
                                disabled={matchingVariant?.stock === 0}
                                className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200 ${
                                  selectedAttributes[variantType] === value
                                    ? 'border-rose-600 bg-rose-50 text-rose-700'
                                    : 'border-neutral-200 text-neutral-600 hover:border-rose-300'
                                } ${matchingVariant?.stock === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                {value}
                                {matchingVariant?.stock === 0 && <span className='text-xs ml-1'>(Out of Stock)</span>}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))
                })()}
              </div>
            )}

            {/* Quantity Selector - always visible */}
            <div>
              <h3 className='text-sm font-semibold text-neutral-900 mb-3'>Quantity</h3>
              <div className='inline-flex items-center border-2 border-neutral-200 rounded-xl overflow-hidden hover:border-rose-300 transition-colors duration-200'>
                <button
                  onClick={() => {
                    if (quantity > 1) {
                      const newQuantity = quantity - 1;
                      setQuantity(newQuantity);
                      if (isInCart) {
                        const hasVars = productData?.variants && productData.variants.length > 0 && productData.variantTypes?.length > 0
                        let cartKey
                        if (hasVars && Object.keys(selectedAttributes).length > 0) {
                          const attrStrings = Object.entries(selectedAttributes)
                            .map(([type, value]) => `${type}:${value}`)
                            .join('::')
                          cartKey = `${productData._id}__${attrStrings}`
                        } else {
                          cartKey = productData._id
                        }
                        updateQuantity(cartKey, newQuantity);
                      }
                    }
                  }}
                  disabled={quantity <= 1}
                  className='px-4 py-3 text-base hover:bg-rose-50 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed'
                >
                  <i className='ri-subtract-line'></i>
                </button>
                <p className='px-6 py-3 border-l border-r border-neutral-200 text-center font-semibold min-w-[60px]'>{quantity}</p>
                <button
                  onClick={() => {
                    const newQuantity = quantity + 1;
                    if (newQuantity <= 999) {
                      setQuantity(newQuantity);
                      if (isInCart) {
                        const hasVars = productData?.variants && productData.variants.length > 0 && productData.variantTypes?.length > 0
                        let cartKey
                        if (hasVars && Object.keys(selectedAttributes).length > 0) {
                          const attrStrings = Object.entries(selectedAttributes)
                            .map(([type, value]) => `${type}:${value}`)
                            .join('::')
                          cartKey = `${productData._id}__${attrStrings}`
                        } else {
                          cartKey = productData._id
                        }
                        updateQuantity(cartKey, newQuantity);
                      }
                    }
                  }}
                  disabled={quantity >= 999}
                  className='px-4 py-3 text-base hover:bg-rose-50 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed'
                >
                  <i className='ri-add-line'></i>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            {displayStock === 0 ? (
              <button
                disabled
                className='w-full bg-neutral-300 text-neutral-500 px-8 py-4 rounded-xl font-semibold cursor-not-allowed text-sm'
              >
                OUT OF STOCK
              </button>
            ) : userProfile?.role === 'wholesale' && userProfile?.isApproved && quantity < (productData.minimumWholesaleQuantity || 10) ? (
              <button
                disabled
                className='w-full bg-neutral-300 text-neutral-500 px-8 py-4 rounded-xl font-semibold cursor-not-allowed text-sm'
              >
                ADD {(productData.minimumWholesaleQuantity || 10) - quantity} MORE TO QUALIFY
              </button>
            ) : (
              <div className='flex gap-3'>
                <button
                  onClick={() => {
                    const hasVars = productData?.variants && productData.variants.length > 0 && productData.variantTypes?.length > 0
                    const cartKey = hasVars && Object.keys(selectedAttributes).length > 0
                      ? `${productData._id}__${Object.entries(selectedAttributes).map(([t, v]) => `${t}:${v}`).join('::')}`
                      : productData._id

                    // Check if cartItems is loaded
                    if (!cartItems || Object.keys(cartItems).length === 0) {
                      // cartItems not loaded yet — safe to just add
                      addToCart(productData._id, quantity, null, hasVars && Object.keys(selectedAttributes).length > 0 ? selectedAttributes : null)
                      setIsInCart(true)
                      return
                    }

                    if (cartItems[cartKey] > 0) {
                      updateQuantity(cartKey, quantity)
                    } else {
                      addToCart(productData._id, quantity, null, hasVars && Object.keys(selectedAttributes).length > 0 ? selectedAttributes : null)
                    }
                    setIsInCart(true)
                  }}
                  className='flex-1 bg-white border-2 border-rose-600 text-rose-600 rounded-xl font-semibold hover:bg-rose-50 transition-all shadow-sm hover:shadow-md px-8 py-4 text-sm'
                >
                  <i className='ri-shopping-cart-line mr-2'></i>
                  ADD TO CART
                </button>
                <button
                  onClick={() => {
                    const hasVars = productData?.variants && productData.variants.length > 0 && productData.variantTypes?.length > 0
                    const cartKey = hasVars && Object.keys(selectedAttributes).length > 0
                      ? `${productData._id}__${Object.entries(selectedAttributes).map(([t, v]) => `${t}:${v}`).join('::')}`
                      : productData._id

                    // Check if cartItems is loaded
                    if (!cartItems || Object.keys(cartItems).length === 0) {
                      // cartItems not loaded yet — safe to just add
                      addToCart(productData._id, quantity, null, hasVars && Object.keys(selectedAttributes).length > 0 ? selectedAttributes : null)
                      navigate('/cart')
                      return
                    }

                    if (cartItems[cartKey] > 0) {
                      updateQuantity(cartKey, quantity)
                    } else {
                      addToCart(productData._id, quantity, null, hasVars && Object.keys(selectedAttributes).length > 0 ? selectedAttributes : null)
                    }
                    navigate('/cart')
                  }}
                  className='flex-1 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-xl font-semibold hover:from-rose-700 hover:to-rose-800 transition-all shadow-md hover:shadow-lg px-8 py-4 text-sm'
                >
                  <i className='ri-flashlight-line mr-2'></i>
                  BUY NOW
                </button>
              </div>
            )}
          </div>

          {/* Two Column Section: Offers + Delivery */}
          <div className='grid grid-cols-2 gap-6 pb-6'>
            {/* Offers Column */}
            <div>
              <h3 className='text-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wide'>Offers Available</h3>
              <ul className='space-y-2 text-sm text-gray-700'>
                <li className='flex items-start gap-2'>
                  <i className='ri-check-line text-rose-600 mt-0.5'></i>
                  <span>Free shipping above ₹99</span>
                </li>
                <li className='flex items-start gap-2'>
                  <i className='ri-check-line text-rose-600 mt-0.5'></i>
                  <span>Cash on delivery available</span>
                </li>
                <li className='flex items-start gap-2'>
                  <i className='ri-check-line text-rose-600 mt-0.5'></i>
                  <span>7 day return & exchange policy</span>
                </li>
                <li className='flex items-start gap-2'>
                  <i className='ri-check-line text-rose-600 mt-0.5'></i>
                  <span>100% original product guaranteed</span>
                </li>
              </ul>
            </div>

            {/* Delivery Column */}
            <div>
              <h3 className='text-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wide'>Delivery</h3>
              <div className='text-sm text-gray-700 space-y-2'>
                <p>✓ Available for all locations</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ---------- Tabs Section (Description + Use Cases) ------------- */}
      <div className='mt-16 bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden'>
        <div className='flex border-b border-neutral-200'>
          <button
            onClick={() => setActiveTab('description')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
              activeTab === 'description' 
                ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50/30' 
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            Description
          </button>
          {productData.useCases && (
            <button
              onClick={() => setActiveTab('use-cases')}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'use-cases' 
                  ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50/30' 
                  : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              Use Cases
            </button>
          )}
        </div>
        
        <div className='p-8'>
          {activeTab === 'description' && (
            <p className='text-neutral-700 leading-relaxed'>{productData.description}</p>
          )}
          {activeTab === 'use-cases' && productData.useCases && (
            <div className='text-neutral-700 whitespace-pre-line leading-relaxed'>{productData.useCases}</div>
          )}
        </div>
      </div>



      {/* --------- Review Section ---------- */}
      <ReviewSection productId={productId} token={token} onReviewChange={fetchProductData} />

      {/* --------- display related products ---------- */}
      <RelatedProducts category={productData.category} currentProductId={productData._id} />

      {/* --------- display recently viewed products ---------- */}
      <RecentlyViewed excludeProductId={productId} />

    </div>
  )
}

export default Product