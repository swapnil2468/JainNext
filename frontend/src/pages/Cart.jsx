import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';
import { toast } from 'react-toastify';
import axios from 'axios';

const Cart = () => {

  const { products, currency, cartItems, updateQuantity, navigate, getProductPrice, canUseWholesalePrice, userProfile, backendUrl, token } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockIssues, setStockIssues] = useState({ outOfStock: [], reducedQty: [] });
  const [showWholesaleModal, setShowWholesaleModal] = useState(false);
  const [wholesaleIssues, setWholesaleIssues] = useState([]);
  const [showDeletedNotification, setShowDeletedNotification] = useState(false);

  useEffect(() => {
    // Check if user has deleted items and show notification once
    if (userProfile?.hasDeletedCartItem && !showDeletedNotification) {
      setShowDeletedNotification(true);
      // Clear the flag after 5 seconds or when dismissed
      const timer = setTimeout(() => clearDeletedNotificationFlag(), 5000);
      return () => clearTimeout(timer);
    }
  }, [userProfile?.hasDeletedCartItem]);

  const clearDeletedNotificationFlag = async () => {
    if (!userProfile?._id) return;
    try {
      await axios.post(
        backendUrl + '/api/user/clear-deleted-notification',
        { userId: userProfile._id },
        { headers: { token } }
      );
    } catch (error) {
      console.error('Failed to clear notification:', error);
    }
  };

  useEffect(() => {
    // Build cartData from both cartItems and products
    // Use cartItems as source of truth (what user added)
    // Use products to validate and get product details
    const tempData = [];
    
    for (const cartKey in cartItems) {
      if (cartItems[cartKey] > 0) {
        // Parse cartKey to extract productId and variant attributes
        // Format: productId__color:value::length:value (can have multiple attributes)
        const [productId, attrString] = cartKey.split('__');
        
        // Parse attributes from attrString (e.g., "color:Green::length:5m")
        const variantAttributes = {};
        if (attrString) {
          const attrPairs = attrString.split('::');
          attrPairs.forEach(pair => {
            const [key, value] = pair.split(':');
            if (key && value) {
              variantAttributes[key] = value;
            }
          });
        }
        
        // Find product - product must exist to display in cart
        const productExists = products.find((product) => product._id === productId);
        
        if (productExists) {
          // Product found - add to cart display
          tempData.push({
            _id: productId,
            cartKey: cartKey,
            variantAttributes: variantAttributes || {},
            quantity: cartItems[cartKey]
          });
        }
        // If product doesn't exist, skip it (don't display, don't delete from cartItems)
        // It will be handled by server-side cleanup on next refresh
      }
    }
    
    // Always update cartData with what we have
    // Don't wait for products to load - build with what's available
    setCartData(tempData);
  }, [cartItems, products])

  // Auto-validate stock on page load
  useEffect(() => {
    if (cartData.length === 0 || products.length === 0) return;

    let outOfStockItems = [];
    let reducedQtyItems = [];
    
    for (const item of cartData) {
      const product = products.find(p => p._id === item._id);
      if (product) {
        // Check variant stock if variant exists
        let availableStock = product.stock;
        let variantDisplayName = product.name;
        
        if (Object.keys(item.variantAttributes).length > 0 && product.variants?.length > 0) {
          // Find matching variant based on ALL attributes
          const matchingVariant = product.variants.find(v => {
            for (const [type, value] of Object.entries(item.variantAttributes)) {
              const variantValue = type === 'color' ? (v.color || v.attributes?.color) : v.attributes?.[type];
              if (variantValue !== value) return false;
            }
            return true;
          });
          
          if (matchingVariant) {
            availableStock = matchingVariant.stock || 0;
            // Format variant display name (e.g., "Green - 5m")
            const attrArray = Object.entries(item.variantAttributes)
              .map(([_, value]) => value)
              .join(' - ');
            variantDisplayName = `${product.name} - ${attrArray}`;
          }
        }
        
        if (item.quantity > availableStock) {
          // Separate into two categories
          if (availableStock === 0) {
            // Out of stock - will be removed
            outOfStockItems.push({
              id: item.cartKey,
              name: variantDisplayName
            });
          } else {
            // Stock reduced but still available
            reducedQtyItems.push({
              id: item.cartKey,
              name: variantDisplayName,
              requestedQty: item.quantity,
              availableStock: availableStock
            });
          }
        }
      }
    }
    
    // Auto-remove out of stock items
    if (outOfStockItems.length > 0) {
      outOfStockItems.forEach(item => {
        updateQuantity(item.id, 0);
      });
    }

    // Auto-reduce qty for partially reduced stock
    if (reducedQtyItems.length > 0) {
      reducedQtyItems.forEach(item => {
        updateQuantity(item.id, item.availableStock);
      });
    }

    // Show modal if any issues found
    if (outOfStockItems.length > 0 || reducedQtyItems.length > 0) {
      setStockIssues({
        outOfStock: outOfStockItems,
        reducedQty: reducedQtyItems
      });
      setShowStockModal(true);
    }
  }, [cartData, products])

  const handleCheckoutClick = async () => {
    // Fetch fresh product data to get latest stock info
    try {
      const response = await axios.get(backendUrl + '/api/product/list', {
        headers: { token }
      });
      
      if (!response.data.success) {
        toast.error('Failed to verify stock. Please try again.');
        return;
      }
      
      const freshProducts = response.data.products;

      // First validate wholesale minimum quantities
      let wholesaleValidationIssues = [];
      
      if (userProfile?.role === 'wholesale' && userProfile?.isApproved) {
        for (const item of cartData) {
          const product = freshProducts.find(p => p._id === item._id);
          if (product) {
            const minQty = product.minimumWholesaleQuantity || 10;
            let variantDisplayName = product.name;
            
            if (Object.keys(item.variantAttributes).length > 0 && product.variants?.length > 0) {
              const attrArray = Object.entries(item.variantAttributes)
                .map(([_, value]) => value)
                .join(' - ');
              variantDisplayName = `${product.name} - ${attrArray}`;
            }
            
            if (item.quantity < minQty) {
              wholesaleValidationIssues.push({
                id: item.cartKey,
                name: variantDisplayName,
                currentQty: item.quantity,
                requiredQty: minQty,
                shortBy: minQty - item.quantity
              });
            }
          }
        }
        
        if (wholesaleValidationIssues.length > 0) {
          setWholesaleIssues(wholesaleValidationIssues);
          setShowWholesaleModal(true);
          return;
        }
      }
      
      // Then validate stock against fresh product data
      let outOfStockItems = [];
      let reducedQtyItems = [];
      
      for (const item of cartData) {
        const product = freshProducts.find(p => p._id === item._id);
        if (product) {
          // Check variant stock if variant exists
          let availableStock = product.stock;
          let variantDisplayName = product.name;
          
          if (Object.keys(item.variantAttributes).length > 0 && product.variants?.length > 0) {
            // Find matching variant based on ALL attributes
            const matchingVariant = product.variants.find(v => {
              for (const [type, value] of Object.entries(item.variantAttributes)) {
                const variantValue = type === 'color' ? (v.color || v.attributes?.color) : v.attributes?.[type];
                if (variantValue !== value) return false;
              }
              return true;
            });
            
            if (matchingVariant) {
              availableStock = matchingVariant.stock || 0;
              // Format variant display name (e.g., "Green - 5m")
              const attrArray = Object.entries(item.variantAttributes)
                .map(([_, value]) => value)
                .join(' - ');
              variantDisplayName = `${product.name} - ${attrArray}`;
            }
          }
          
          if (item.quantity > availableStock) {
            if (availableStock === 0) {
              outOfStockItems.push({
                id: item.cartKey,
                name: variantDisplayName
              });
            } else {
              reducedQtyItems.push({
                id: item.cartKey,
                name: variantDisplayName,
                requestedQty: item.quantity,
                availableStock: availableStock
              });
            }
          }
        }
      }
      
      if (outOfStockItems.length > 0 || reducedQtyItems.length > 0) {
        // Auto-remove out of stock items
        outOfStockItems.forEach(item => {
          updateQuantity(item.id, 0);
        });
        
        // Auto-reduce qty
        reducedQtyItems.forEach(item => {
          updateQuantity(item.id, item.availableStock);
        });

        setStockIssues({
          outOfStock: outOfStockItems,
          reducedQty: reducedQtyItems
        });
        setShowStockModal(true);
      } else {
        navigate('/place-order');
      }
    } catch (error) {
      toast.error('Error checking stock availability');
      console.error(error);
    }
  };

  return (
    <>
    {/* Stock Validation Modal */}
    {showStockModal && (
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowStockModal(false)}>
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {/* Body */}
          <div className="px-6 pt-8 pb-4 text-center">
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Stock Update</h3>
            <p className="text-sm text-gray-500 mb-4">Your cart has been adjusted due to stock changes:</p>

            {/* Out of Stock Items */}
            {typeof stockIssues === 'object' && stockIssues.outOfStock && stockIssues.outOfStock.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-rose-700 text-left mb-2">Removed (Out of Stock):</p>
                <div className="space-y-2">
                  {stockIssues.outOfStock.map((item, index) => (
                    <div key={index} className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-left">
                      <p className="font-medium text-rose-900 text-sm">{item.name}</p>
                      <p className="text-xs text-rose-700 mt-1">This product is out of stock and has been removed from your cart</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reduced Qty Items */}
            {typeof stockIssues === 'object' && stockIssues.reducedQty && stockIssues.reducedQty.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-amber-700 text-left mb-2">Quantity Adjusted:</p>
                <div className="space-y-2">
                  {stockIssues.reducedQty.map((item, index) => (
                    <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left">
                      <p className="font-medium text-amber-900 text-sm">{item.name}</p>
                      <p className="text-xs text-amber-700 mt-1">Quantity has been reduced to <span className="font-semibold">{item.availableStock}</span> (available stock)</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-neutral-100" />

          {/* Actions */}
          <div className="flex">
            <button
              className="flex-1 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 transition-all"
              onClick={() => {
                setShowStockModal(false);
                // Check if any items remain after adjustments
                const hasRemainingItems = cartData.some(item => item.quantity > 0);
                if (hasRemainingItems) {
                  navigate('/place-order');
                } else {
                  toast.info('All items in your cart are out of stock.');
                }
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Wholesale Quantity Validation Modal */}
    {showWholesaleModal && (
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowWholesaleModal(false)}>
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {/* Body */}
          <div className="px-6 pt-8 pb-4 text-center">
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Wholesale Minimum Quantity Required</h3>
            <p className="text-sm text-gray-500 mb-4">The following items don't meet the minimum wholesale quantity:</p>

            {/* Issue list */}
            <div className="space-y-2 text-left mb-4 max-h-64 overflow-y-auto">
              {wholesaleIssues.map((issue, index) => (
                <div key={index} className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                  <p className="font-medium text-gray-800 text-sm">{issue.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    In cart: <span className="font-semibold text-orange-600">{issue.currentQty}</span>
                    &nbsp;·&nbsp; Required: <span className="font-semibold text-orange-700">{issue.requiredQty}</span>
                  </p>
                  <p className="text-xs text-orange-600 mt-1 font-medium">Add {issue.shortBy} more to qualify</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 mb-4">Please increase quantities to meet the minimum requirements.</p>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 flex gap-2 px-6 py-4">
            <button
              onClick={() => setShowWholesaleModal(false)}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-150 text-sm"
            >
              Continue Editing
            </button>
          </div>
        </div>
      </div>
    )}
    
    <div className='min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 pt-24 px-6 lg:px-8 pb-20'>

      {/* Page Header */}
      <div className='mb-8'>
        <h1 className='text-4xl font-bold text-black' style={{fontFamily: 'Inter, sans-serif'}}>
          Your <span className='text-rose-600'>Cart</span>
        </h1>
        <div className='w-16 h-0.5 bg-rose-600 mt-2'></div>
      </div>

      {/* Deleted Product Notification */}
      {showDeletedNotification && (
        <div className='mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3'>
          <svg className='w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' />
          </svg>
          <div className='flex-1'>
            <h3 className='font-semibold text-amber-900'>Product No Longer Available</h3>
            <p className='text-sm text-amber-700 mt-1'>One or more items in your cart have been removed by the admin. We've cleaned them up for you.</p>
          </div>
          <button
            onClick={() => {
              setShowDeletedNotification(false);
              clearDeletedNotificationFlag();
            }}
            className='flex-shrink-0 text-amber-600 hover:text-amber-800 transition-colors'
          >
            <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>
      )}

      {cartData.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-32 max-w-2xl mx-auto'>
          <div className='w-28 h-28 bg-gradient-to-br from-rose-50 via-rose-100 to-rose-50 rounded-2xl flex items-center justify-center mb-8 shadow-sm border border-rose-200/50'>
            <i className='ri-shopping-cart-line text-5xl text-rose-500'></i>
          </div>
          <h2 className='text-4xl font-semibold text-neutral-900 mb-4'>Your Cart is Empty</h2>
          <p className='text-neutral-600 mb-3 text-lg'>Looks like you haven't added anything yet!</p>
          <p className='text-neutral-500 text-base mb-10'>Browse our amazing collection and find something you love</p>
          <button
            onClick={() => navigate('/collection')}
            className='bg-gradient-to-r from-rose-600 to-rose-700 text-white px-10 py-4 rounded-xl font-semibold hover:from-rose-700 hover:to-rose-800 transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 flex items-center gap-2'
          >
            <i className='ri-shopping-bag-line'></i>
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          {/* Main Layout - Side by Side */}
          <div className='flex flex-col lg:flex-row gap-8 items-start'>

            {/* LEFT - Cart Items (takes most space) */}
            <div className='flex-1 bg-white rounded-2xl border border-neutral-200 shadow-md hover:shadow-lg transition-shadow overflow-hidden'>
            {/* Header row */}
            <div className='hidden sm:grid grid-cols-[3fr_1fr_1fr_1fr_0.5fr] gap-4 px-6 py-5 bg-gradient-to-r from-neutral-50 to-white border-b border-neutral-150'>
              <p className='text-xs font-bold text-neutral-700 uppercase tracking-widest'>Product</p>
              <p className='text-xs font-bold text-neutral-700 uppercase tracking-widest'>Price</p>
              <p className='text-xs font-bold text-neutral-700 uppercase tracking-widest'>Quantity</p>
              <p className='text-xs font-bold text-neutral-700 uppercase tracking-widest'>Total</p>
              <p className='text-xs font-bold text-neutral-700 uppercase tracking-widest text-center'>Remove</p>
            </div>
            {/* Cart items */}
            {
              cartData.map((item, index) => {
                const productData = products.find((product) => product._id === item._id);
                
                // Helper function to find matching variant
                const findMatchingVariant = () => {
                  if (Object.keys(item.variantAttributes).length === 0 || !productData?.variants?.length) {
                    return null;
                  }
                  
                  // Strict match: find variant matching ALL provided attributes
                  const strictMatch = productData.variants.find(v => {
                    for (const [type, value] of Object.entries(item.variantAttributes)) {
                      const variantValue = type === 'color' ? (v.color || v.attributes?.color) : v.attributes?.[type];
                      if (variantValue !== value) return false;
                    }
                    return true;
                  });
                  
                  if (strictMatch) return strictMatch;
                  
                  // Fallback 1: If we have a color attribute, try to match by color alone
                  if (item.variantAttributes.color && !productData.variantTypes?.includes('length')) {
                    return productData.variants.find(v => 
                      (v.color === item.variantAttributes.color || v.attributes?.color === item.variantAttributes.color)
                    );
                  }
                  
                  // Fallback 2: Return first variant if color exists in attributes (for backward compat)
                  if (item.variantAttributes.color) {
                    const colorVariant = productData.variants.find(v => 
                      (v.color === item.variantAttributes.color || v.attributes?.color === item.variantAttributes.color)
                    );
                    if (colorVariant) return colorVariant;
                  }
                  
                  // Fallback 3: Return first variant if nothing matches
                  return productData.variants[0] || null;
                };
                
                const matchingVariant = findMatchingVariant();
                
                // Format variant display (e.g., "Green - 5m")
                const formatVariantDisplay = () => {
                  if (Object.keys(item.variantAttributes).length === 0) return null;
                  return Object.entries(item.variantAttributes)
                    .map(([_, value]) => value)
                    .join(' - ');
                };
                
                const variantDisplay = formatVariantDisplay();
                
                return productData ? (
                  <div key={index} className='block sm:grid sm:grid-cols-[3fr_1fr_1fr_1fr_0.5fr] gap-4 px-6 py-5 border-b border-neutral-100 last:border-0 sm:items-center'>
                    {/* Product */}
                    <div className='flex items-center gap-4 mb-4 sm:mb-0'>
                      <div className='w-20 h-20 rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100 flex-shrink-0 flex items-center justify-center'>
                        <img
                          className='w-full h-full object-cover'
                          src={(() => {
                            if (matchingVariant?.images?.length > 0) {
                              return matchingVariant.images[0];
                            }
                            const imageUrl = productData.image?.[0];
                            return imageUrl || 'https://via.placeholder.com/80?text=No+Image';
                          })()}
                          alt={productData.name}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                          }}
                        />
                      </div>
                      <div>
                        <p className='font-medium text-neutral-900 text-sm sm:text-base line-clamp-2'>{productData.name}</p>
                        <p className='text-xs text-neutral-500 mt-1'>{productData.category}</p>
                        <div className='flex gap-2 items-center flex-wrap mt-1'>
                          {variantDisplay && (
                            <span className='inline-flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full'>
                              {matchingVariant?.colorCode && (
                                <span className='w-2.5 h-2.5 rounded-full' style={{backgroundColor: matchingVariant.colorCode}}></span>
                              )}
                              {variantDisplay}
                            </span>
                          )}
                          {canUseWholesalePrice(productData, item.quantity) && (
                            <span className='text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full'>Wholesale</span>
                          )}
                          {userProfile?.role === 'wholesale' && userProfile?.isApproved && item.quantity < (productData.minimumWholesaleQuantity || 10) && (
                            <span className='text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full'>⚠️ Add {(productData.minimumWholesaleQuantity || 10) - item.quantity} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Price */}
                    <div className='flex justify-between items-center sm:block'>
                      <span className='text-xs font-bold text-neutral-500 sm:hidden'>Price</span>
                      {(() => {
                        if (matchingVariant) {
                          const variantPrice = (matchingVariant.price !== undefined && matchingVariant.price !== null && matchingVariant.price !== '') ? Number(matchingVariant.price) : (productData.retailPrice || productData.price);
                          return <p className='font-bold text-neutral-900 text-base'>{currency}{variantPrice || 0}</p>;
                        }
                        // For variant products without main price, use first variant price
                        let price = getProductPrice(productData, 1) || productData.retailPrice || productData.price;
                        if (!price && productData?.variants?.[0]?.price) {
                          price = productData.variants[0].price;
                        }
                        price = price || 0;
                        return <p className='font-bold text-neutral-900 text-base'>{currency}{price}</p>;
                      })()}
                    </div>
                    {/* Quantity */}
                    <div className='flex justify-between items-center sm:block'>
                      <span className='text-xs font-bold text-neutral-500 sm:hidden'>Qty</span>
                      <div className='flex items-center border-2 border-neutral-200 rounded-lg overflow-hidden hover:border-rose-400 hover:shadow-sm transition-all w-fit'>
                      <button
                        onClick={() => item.quantity > 1 ? updateQuantity(item.cartKey, item.quantity - 1) : updateQuantity(item.cartKey, 0)}
                        className='px-3.5 py-2.5 hover:bg-rose-50 transition-colors text-neutral-700 font-medium text-lg'
                      >
                        <i className='ri-subtract-line'></i>
                      </button>
                      <input
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val >= 0 && val <= 999) updateQuantity(item.cartKey, val)
                        }}
                        className='w-14 text-center py-2 text-sm font-bold border-l border-r border-neutral-200 focus:outline-none bg-white'
                        type='number'
                        min={1}
                        max={999}
                        value={item.quantity}
                      />
                      <button
                        onClick={() => item.quantity < 999 && updateQuantity(item.cartKey, item.quantity + 1)}
                        disabled={item.quantity >= 999}
                        className='px-3.5 py-2.5 hover:bg-rose-50 transition-colors text-neutral-700 font-medium text-lg disabled:opacity-40 disabled:cursor-not-allowed'
                      >
                        <i className='ri-add-line'></i>
                      </button>
                    </div>
                    </div>
                    {/* Total */}
                    <div className='flex justify-between items-center sm:block'>
                      <span className='text-xs font-bold text-neutral-500 sm:hidden'>Total</span>
                      {(() => {
                        if (matchingVariant) {
                          const variantPrice = (matchingVariant.price !== undefined && matchingVariant.price !== null && matchingVariant.price !== '') ? Number(matchingVariant.price) : (productData.retailPrice || productData.price);
                          const totalPrice = (variantPrice || 0) * item.quantity;
                          return <p className='font-bold text-neutral-900 text-base'>{currency}{totalPrice}</p>;
                        }
                        const unitPrice = getProductPrice(productData, 1) || productData.retailPrice || productData.price || (productData?.variants?.[0]?.price) || 0;
                        const totalPrice = unitPrice * item.quantity;
                        return <p className='font-bold text-neutral-900 text-base'>{currency}{totalPrice}</p>;
                      })()}
                    </div>
                    {/* Remove */}
                    <div className='flex justify-end sm:justify-center'>
                      <button
                        onClick={() => updateQuantity(item.cartKey, 0)}
                        className='w-9 h-9 flex items-center justify-center rounded-full hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-all'
                      >
                        <i className='ri-delete-bin-line text-xl'></i>
                      </button>
                    </div>
                  </div>
                ) : null
              })
            }
            </div>

            {/* RIGHT - Order Summary (fixed width, sticky) */}
            <div className='w-full lg:w-[380px] flex-shrink-0 sticky top-24'>
              <div className='bg-white rounded-2xl border border-neutral-200 shadow-lg p-7'>
                <div className='flex items-center gap-2.5 mb-7 pb-5 border-b border-neutral-150'>
                  <div className='w-10 h-10 bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg flex items-center justify-center'>
                    <i className='ri-bill-line text-rose-600'></i>
                  </div>
                  <h3 className='text-2xl font-semibold text-neutral-900'>Summary</h3>
                </div>
                <CartTotal />
                <button
                  onClick={handleCheckoutClick}
                  className='w-full bg-gradient-to-r from-rose-600 to-rose-700 text-white py-4 rounded-xl font-semibold hover:from-rose-700 hover:to-rose-800 transition-all hover:shadow-xl hover:-translate-y-0.5 mt-8 flex items-center justify-center gap-2 text-base active:scale-95'
                >
                  <i className='ri-lock-line text-lg'></i>
                  Proceed to Checkout
                </button>
                <button
                  onClick={() => navigate('/collection')}
                  className='w-full mt-3 py-3.5 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors rounded-lg text-center border border-rose-200'
                >
                  ← Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </>

      )}

    </div>
    </>
  )
}

export default Cart
