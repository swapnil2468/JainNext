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

    if (products.length > 0) {
      const tempData = [];
      
      for (const items in cartItems) {
        if (cartItems[items] > 0) {
          // Only add to cart if product still exists
          const productExists = products.find((product) => product._id === items);
          if (productExists) {
            tempData.push({
              _id: items,
              quantity: cartItems[items]
            })
          }
        }
      }
      
      setCartData(tempData);
    }
  }, [cartItems, products])

  const handleCheckoutClick = () => {
    // Validate stock before proceeding to checkout
    let stockValidationIssues = [];
    
    for (const item of cartData) {
      const product = products.find(p => p._id === item._id);
      if (product && item.quantity > product.stock) {
        stockValidationIssues.push({
          id: item._id,
          name: product.name,
          requestedQty: item.quantity,
          availableStock: product.stock
        });
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
      const issue = stockIssues.find(i => i.id === item._id);
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
    
    <div className='min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 pt-24 px-6 lg:px-8'>

      <div className='mb-8'>
        <h1 className='text-4xl font-light text-neutral-900'>
          Your <span className='font-medium text-rose-600'>Cart</span>
        </h1>
        <div className='w-16 h-0.5 bg-rose-600 mt-2'></div>
      </div>

      {cartData.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-32'>
          <div className='w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6'>
            <i className='ri-shopping-cart-line text-4xl text-rose-400'></i>
          </div>
          <h2 className='text-3xl font-light text-neutral-900 mb-3'>Your Cart is Empty</h2>
          <p className='text-neutral-500 mb-2'>Looks like you haven't added anything yet!</p>
          <p className='text-neutral-400 text-sm mb-8'>Browse our amazing products and find something you love ✨</p>
          <button
            onClick={() => navigate('/collection')}
            className='bg-gradient-to-r from-rose-600 to-rose-700 text-white px-8 py-4 rounded-full font-medium hover:from-rose-700 hover:to-rose-800 transition-all hover:shadow-lg hover:-translate-y-0.5'
          >
            Start Shopping Now
          </button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className='bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden mb-8'>
            {/* Header row */}
            <div className='hidden sm:grid grid-cols-[3fr_1fr_1fr_0.5fr] gap-4 px-6 py-4 bg-neutral-50 border-b border-neutral-100'>
              <p className='text-sm font-semibold text-neutral-600 uppercase tracking-wide'>Product</p>
              <p className='text-sm font-semibold text-neutral-600 uppercase tracking-wide'>Price</p>
              <p className='text-sm font-semibold text-neutral-600 uppercase tracking-wide'>Quantity</p>
              <p className='text-sm font-semibold text-neutral-600 uppercase tracking-wide'>Remove</p>
            </div>
            {/* Cart items */}
            {
              cartData.map((item, index) => {
                const productData = products.find((product) => product._id === item._id);
                return productData ? (
                  <div key={index} className='grid grid-cols-[3fr_1fr_1fr_0.5fr] gap-4 px-6 py-5 border-b border-neutral-100 last:border-0 items-center'>
                    {/* Product */}
                    <div className='flex items-center gap-4'>
                      <div className='w-20 h-20 rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100 flex-shrink-0'>
                        <img className='w-full h-full object-cover' src={productData.image[0]} alt='' />
                      </div>
                      <div>
                        <p className='font-medium text-neutral-900 text-sm sm:text-base line-clamp-2'>{productData.name}</p>
                        <p className='text-xs text-neutral-500 mt-1'>{productData.category}</p>
                        {canUseWholesalePrice(productData, item.quantity) && (
                          <span className='text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full mt-1 inline-block'>Wholesale</span>
                        )}
                      </div>
                    </div>
                    {/* Price */}
                    <p className='font-medium text-neutral-900'>{currency}{getProductPrice(productData, item.quantity)}</p>
                    {/* Quantity */}
                    <div className='flex items-center border-2 border-neutral-200 rounded-xl overflow-hidden hover:border-rose-300 transition-colors w-fit'>
                      <button
                        onClick={() => item.quantity > 1 ? updateQuantity(item._id, item.quantity - 1) : updateQuantity(item._id, 0)}
                        className='px-3 py-2 hover:bg-rose-50 transition-colors text-neutral-600'
                      >
                        <i className='ri-subtract-line'></i>
                      </button>
                      <input
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val >= 0 && val <= 999) updateQuantity(item._id, val)
                        }}
                        className='w-12 text-center py-2 text-sm font-medium border-l border-r border-neutral-200 focus:outline-none'
                        type='number'
                        min={1}
                        max={999}
                        value={item.quantity}
                      />
                      <button
                        onClick={() => item.quantity < 999 && updateQuantity(item._id, item.quantity + 1)}
                        disabled={item.quantity >= 999}
                        className='px-3 py-2 hover:bg-rose-50 transition-colors text-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed'
                      >
                        <i className='ri-add-line'></i>
                      </button>
                    </div>
                    {/* Remove */}
                    <button
                      onClick={() => updateQuantity(item._id, 0)}
                      className='w-9 h-9 flex items-center justify-center rounded-full hover:bg-rose-50 hover:text-rose-600 text-neutral-400 transition-colors'
                    >
                      <i className='ri-delete-bin-line text-lg'></i>
                    </button>
                  </div>
                ) : null
              })
            }
          </div>

          {/* Cart Totals and Checkout */}
          <div className='flex justify-end mb-20'>
            <div className='w-full sm:w-[450px] bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6'>
              <h3 className='text-xl font-light text-neutral-900 mb-6 pb-4 border-b border-neutral-100'>
                Order <span className='font-medium'>Summary</span>
              </h3>
              <CartTotal />
              <button
                onClick={handleCheckoutClick}
                className='w-full bg-gradient-to-r from-rose-600 to-rose-700 text-white py-4 rounded-xl font-medium hover:from-rose-700 hover:to-rose-800 transition-all hover:shadow-lg hover:-translate-y-0.5 mt-6 flex items-center justify-center gap-2'
              >
                <i className='ri-lock-line'></i>
                Proceed to Checkout
              </button>
              <button
                onClick={() => navigate('/collection')}
                className='w-full mt-3 py-3 text-sm text-neutral-600 hover:text-rose-600 transition-colors text-center'
              >
                ← Continue Shopping
              </button>
            </div>
          </div>
        </>

      )}

    </div>
    </>
  )
}

export default Cart
