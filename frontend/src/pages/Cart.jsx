import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
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
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Limited Stock Available</h3>
            <p className="text-sm text-gray-500 mb-4">Some items in your cart exceed available stock:</p>

            {/* Issue list */}
            <div className="space-y-2 text-left mb-2">
              {stockIssues.map((issue, index) => (
                <div key={index} className="bg-orange-50 border border-orange-100 rounded-xl p-3">
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
          <div className="h-px bg-gray-100" />

          {/* Actions */}
          <div className="flex">
            <button
              className="flex-1 py-3.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-150 border-r border-gray-100"
              onClick={() => setShowStockModal(false)}
            >
              Cancel
            </button>
            <button
              className="flex-1 py-3.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors duration-150"
              onClick={handleStockUpdate}
            >
              Update &amp; Proceed
            </button>
          </div>
        </div>
      </div>
    )}
    
    <div className='border-t pt-14'>

      <div className=' text-2xl mb-3'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      {cartData.length === 0 ? (
        // Empty Cart State
        <div className='flex flex-col items-center justify-center py-20'>
          <div className='text-center'>
            <div className='mb-6 text-6xl'>🛒</div>
            <h2 className='text-3xl font-bold text-gray-800 mb-2'>Your Cart is Empty</h2>
            <p className='text-gray-500 text-lg mb-3'>Looks like you haven't added anything yet!</p>
            <p className='text-gray-400 text-sm mb-8'>Don't miss out on our amazing products ✨</p>
            
            <button 
              onClick={() => navigate('/collection')}
              className='bg-black text-white px-8 py-3 rounded text-lg font-medium hover:bg-gray-800 transition-colors'
            >
              Start Shopping Now
            </button>
            
            <div className='mt-8 text-gray-400 text-sm'>
              <p>💡 Pro tip: Browse our latest collection to find the perfect products!</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div>
            {
              cartData.map((item, index) => {

                const productData = products.find((product) => product._id === item._id);

                return productData ? (
                  <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                    <div className=' flex items-start gap-6'>
                      <img className='w-16 sm:w-20' src={productData.image[0]} alt="" />
                      <div>
                        <p className='text-xs sm:text-lg font-medium'>{productData.name}</p>
                        <div className='flex items-center gap-5 mt-2'>
                          <p>{currency}{getProductPrice(productData, item.quantity)}</p>
                          {canUseWholesalePrice(productData, item.quantity) && (
                            <span className='text-xs text-green-600 font-medium'>Wholesale</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <button 
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item._id, item.quantity - 1)
                          } else {
                            updateQuantity(item._id, 0)
                          }
                        }}
                        className='border px-2 py-1 cursor-pointer'
                      >
                        −
                      </button>
                      <input 
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val >= 0 && val <= 999) {
                            updateQuantity(item._id, val)
                          }
                        }} 
                        className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1 text-center' 
                        type="number" 
                        min={1}
                        max={999}
                        value={item.quantity} 
                      />
                      <button 
                        onClick={() => {
                          if (item.quantity < 999) {
                            updateQuantity(item._id, item.quantity + 1)
                          }
                        }}
                        disabled={item.quantity >= 999}
                        className={`border px-2 py-1 ${
                          item.quantity >= 999 
                            ? 'cursor-not-allowed opacity-40 bg-gray-100' 
                            : 'cursor-pointer hover:bg-gray-50'
                        }`}
                      >
                        +
                      </button>
                    </div>
                    <img 
                      onClick={() => updateQuantity(item._id, 0)} 
                      className='w-4 mr-4 sm:w-5 cursor-pointer' 
                      src={assets.bin_icon} 
                      alt="" 
                    />
                  </div>
                ) : null

              })
            }
          </div>

          {/* Cart Totals and Checkout */}
          <div className='flex justify-end my-20'>
            <div className='w-full sm:w-[450px]'>
              <CartTotal />
              <div className=' w-full text-end'>
                <button onClick={handleCheckoutClick} className='bg-red-600 hover:bg-red-700 text-white text-sm font-medium my-8 px-8 py-3 rounded-lg transition-all duration-300 active:scale-95 shadow-md hover:shadow-lg'>PROCEED TO CHECKOUT</button>
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
