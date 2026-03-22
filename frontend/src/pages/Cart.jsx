import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';
import { toast } from 'react-toastify';

const Cart = () => {

  const { products, currency, cartItems, updateQuantity, navigate, getProductPrice, canUseWholesalePrice } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockIssues, setStockIssues] = useState([]);

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

  const handleCheckoutClick = () => {
    // Validate stock before proceeding to checkout
    let stockValidationIssues = [];
    
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
          stockValidationIssues.push({
            id: item.cartKey,
            name: variantDisplayName,
            requestedQty: item.quantity,
            availableStock: availableStock
          });
        }
      }
    }
    
    if (stockValidationIssues.length > 0) {
      setStockIssues(stockValidationIssues);
      setShowStockModal(true);
    } else {
      navigate('/place-order');
    }
  };

  const handleStockUpdate = () => {
    // Update cart quantities to available stock
    stockIssues.forEach(issue => {
      updateQuantity(issue.id, issue.availableStock);
    });
    setShowStockModal(false);

    // Check if any items remain after the stock correction
    const hasRemainingItems = cartData.some(item => {
      const issue = stockIssues.find(i => i.id === item.cartKey);
      return issue ? issue.availableStock > 0 : true;
    });

    if (!hasRemainingItems) {
      toast.info('All items in your cart are out of stock and have been removed.');
      return;
    }

    toast.success('Cart updated! You can now proceed to checkout.');
    // Navigate to checkout after a brief delay to show the update
    setTimeout(() => {
      navigate('/place-order');
    }, 800);
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
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Limited Stock Available</h3>
            <p className="text-sm text-gray-500 mb-4">Some items in your cart exceed available stock:</p>

            {/* Issue list */}
            <div className="space-y-2 text-left mb-2">
              {stockIssues.map((issue, index) => (
                <div key={index} className="bg-neutral-50 border border-neutral-100 rounded-xl p-3">
                  <p className="font-medium text-gray-800 text-sm">{issue.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    In cart: <span className="font-semibold text-red-500">{issue.requestedQty}</span>
                    &nbsp;·&nbsp; Available: <span className="font-semibold text-green-600">{issue.availableStock}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-neutral-100" />

          {/* Actions */}
          <div className="flex">
            <button
              className="flex-1 py-3.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors duration-150 border-r border-neutral-100"
              onClick={() => setShowStockModal(false)}
            >
              Cancel
            </button>
            <button
              className="flex-1 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 transition-all"
              onClick={handleStockUpdate}
            >
              Update &amp; Proceed
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
                  return productData.variants.find(v => {
                    for (const [type, value] of Object.entries(item.variantAttributes)) {
                      const variantValue = type === 'color' ? (v.color || v.attributes?.color) : v.attributes?.[type];
                      if (variantValue !== value) return false;
                    }
                    return true;
                  });
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
                  <div key={index} className='grid grid-cols-[3fr_1fr_1fr_1fr_0.5fr] gap-4 px-6 py-5 border-b border-neutral-100 last:border-0 items-center'>
                    {/* Product */}
                    <div className='flex items-center gap-4'>
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
                        </div>
                      </div>
                    </div>
                    {/* Price */}
                    {(() => {
                      if (matchingVariant) {
                        const variantPrice = matchingVariant.price || productData.retailPrice || productData.price;
                        return <p className='font-bold text-neutral-900 text-base'>{currency}{variantPrice}</p>;
                      }
                      return <p className='font-bold text-neutral-900 text-base'>{currency}{getProductPrice(productData, item.quantity)}</p>;
                    })()}
                    {/* Quantity */}
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
                    {/* Total */}
                    {(() => {
                      if (matchingVariant) {
                        const variantPrice = matchingVariant.price || productData.retailPrice || productData.price;
                        const totalPrice = variantPrice * item.quantity;
                        return <p className='font-bold text-neutral-900 text-base'>{currency}{totalPrice}</p>;
                      }
                      const unitPrice = getProductPrice(productData, 1);
                      const totalPrice = unitPrice * item.quantity;
                      return <p className='font-bold text-neutral-900 text-base'>{currency}{totalPrice}</p>;
                    })()}
                    {/* Remove */}
                    <button
                      onClick={() => updateQuantity(item.cartKey, 0)}
                      className='w-9 h-9 flex items-center justify-center rounded-full hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-all mx-auto'
                    >
                      <i className='ri-delete-bin-line text-xl'></i>
                    </button>
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
