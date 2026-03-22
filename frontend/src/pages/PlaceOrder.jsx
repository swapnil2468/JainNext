import React, { useContext, useState, useEffect } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PlaceOrder = () => {

    const [method, setMethod] = useState('cod');
    const [loading, setLoading] = useState(false);
    const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!token) {
            toast.warn('Please login to continue')
            navigate('/login')
        }
    }, [token, navigate])
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: ''
    })

    const onChangeHandler = (event) => {
        const name = event.target.name
        let value = event.target.value
        
        // Phone number: store raw 10 digits only; +91 is prepended at submission time
        if (name === 'phone') {
            value = value.replace(/\D/g, '').slice(0, 10);
        }
        
        // Zipcode validation (Indian zipcode is 6 digits)
        if (name === 'zipcode') {
            // Only allow digits
            value = value.replace(/\D/g, '');
            // Limit to 6 digits
            if (value.length > 6) {
                value = value.slice(0, 6);
            }
        }
        
        setFormData(data => ({ ...data, [name]: value }))
    }

    const initPay = (order) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name:'Order Payment',
            description:'Order Payment',
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                try {
                    
                    const { data } = await axios.post(backendUrl + '/api/order/verifyRazorpay',response,{headers:{token}})
                    if (data.success) {
                        navigate('/orders')
                        setCartItems({})
                    }
                } catch (error) {
                    console.error('Razorpay verification error:', error)
                    toast.error(error.message)
                }
            }
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        
        // Validate form data
        const { firstName, lastName, email, street, city, state, zipcode, country, phone } = formData;
        
        // Check required fields
        if (!firstName || !lastName || !email || !street || !city || !state || !zipcode || !country || !phone) {
            toast.error('Please fill all fields');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }
        
        // Validate phone: must be exactly 10 digits
        if (!/^\d{10}$/.test(phone)) {
            toast.error('Please enter a valid 10-digit mobile number');
            return;
        }
        
        // Validate Indian zipcode (6 digits)
        const zipcodeStr = zipcode.toString();
        if (!/^\d{6}$/.test(zipcodeStr)) {
            toast.error('Zipcode must be 6 digits');
            return;
        }
        
        setLoading(true);
        
        try {

            let orderItems = []

            for (const cartKey in cartItems) {
                if (cartItems[cartKey] > 0) {
                    // Parse cartKey to extract productId and variant attributes
                    // Format: productId (non-variant) or productId__color:value::length:value (variant)
                    const [productId, attrString] = cartKey.split('__')
                    
                    // Parse variant attributes from attrString
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
                    
                    const product = products.find(p => p._id === productId)
                    if (product) {
                        const itemInfo = structuredClone(product)
                        itemInfo.quantity = cartItems[cartKey]
                        
                        // Find matching variant if variant attributes exist
                        let matchingVariant = null
                        if (Object.keys(variantAttributes).length > 0 && product.variants?.length > 0) {
                            matchingVariant = product.variants.find(v => {
                                for (const [type, value] of Object.entries(variantAttributes)) {
                                    const variantValue = type === 'color' ? (v.color || v.attributes?.color) : v.attributes?.[type];
                                    if (variantValue !== value) return false;
                                }
                                return true;
                            })
                        }
                        
                        // Ensure price fields are set
                        if (matchingVariant) {
                            // Store raw attribute string (e.g., "color:Green::length:5m") for backend validation
                            // Backend will parse this to find the variant
                            itemInfo.selectedVariant = attrString
                            
                            if (matchingVariant.price) {
                                itemInfo.price = matchingVariant.price
                                itemInfo.retailPrice = matchingVariant.price
                            } else if (!itemInfo.retailPrice && !itemInfo.price) {
                                itemInfo.retailPrice = product.retailPrice || product.price || 0
                                itemInfo.price = product.retailPrice || product.price || 0
                            }
                        } else {
                            // Non-variant: ensure both fields are set
                            if (!itemInfo.retailPrice && !itemInfo.price) {
                                itemInfo.retailPrice = product.retailPrice || product.price || 0
                                itemInfo.price = product.retailPrice || product.price || 0
                            }
                        }
                        
                        orderItems.push(itemInfo)
                    }
                }
            }

            let orderData = {
                address: { ...formData, phone: '+91' + formData.phone },
                items: orderItems,
                amount: getCartAmount() + delivery_fee
            }
            

            switch (method) {

                // API Calls for COD
                case 'cod':
                    const response = await axios.post(backendUrl + '/api/order/place',orderData,{headers:{token}})
                    if (response.data.success) {
                        setCartItems({})
                        navigate('/orders')
                    } else {
                        toast.error(response.data.message)
                    }
                    break;

                case 'razorpay':

                    const responseRazorpay = await axios.post(backendUrl + '/api/order/razorpay', orderData, {headers:{token}})
                    if (responseRazorpay.data.success) {
                        initPay(responseRazorpay.data.order)
                    }

                    break;

                default:
                    break;
            }


        } catch (error) {
            console.error('Order placement error:', error)
            toast.error(error.message)
        } finally {
            setLoading(false);
        }
    }


    return (
            <div className='min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 pt-24 px-6 lg:px-8 pb-20'>

                {/* Header */}
                <div className='mb-8'>
                <h1 className='text-4xl font-light text-neutral-900'>
                    Checkout
                </h1>
                <div className='w-16 h-0.5 bg-rose-600 mt-2'></div>
                </div>

                <form onSubmit={onSubmitHandler}>
                <div className='flex flex-col lg:flex-row gap-8'>

                    {/* LEFT - Delivery Information */}
                    <div className='flex-1'>

                    {/* Delivery Info Card */}
                    <div className='bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-8'>
                        <h2 className='text-2xl font-light text-neutral-900 mb-8 flex items-center gap-2'>
                        Delivery
                        <span className='font-medium text-rose-600'>Information</span>
                        </h2>

                        <div className='space-y-6'>
                        <div className='grid grid-cols-2 gap-6'>
                            <div>
                            <label className='block text-sm font-medium text-neutral-700 mb-2.5'>First Name *</label>
                            <input
                                required
                                onChange={onChangeHandler}
                                name='firstName'
                                value={formData.firstName}
                                type='text'
                                placeholder='First name'
                                minLength='2'
                                maxLength='50'
                                className='w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-sm'
                            />
                            </div>
                            <div>
                            <label className='block text-sm font-medium text-neutral-700 mb-2.5'>Last Name *</label>
                            <input
                                required
                                onChange={onChangeHandler}
                                name='lastName'
                                value={formData.lastName}
                                type='text'
                                placeholder='Last name'
                                minLength='2'
                                maxLength='50'
                                className='w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-sm'
                            />
                            </div>
                        </div>



                        <div>
                            <label className='block text-sm font-medium text-neutral-700 mb-2.5'>Email Address *</label>
                            <input
                            required
                            onChange={onChangeHandler}
                            name='email'
                            value={formData.email}
                            type='email'
                            placeholder='your@email.com'
                            className='w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-sm'
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-neutral-700 mb-2.5'>Street Address *</label>
                            <input
                            required
                            onChange={onChangeHandler}
                            name='street'
                            value={formData.street}
                            type='text'
                            placeholder='House no, Street name'
                            minLength='5'
                            maxLength='200'
                            className='w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-sm'
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-6'>
                            <div>
                            <label className='block text-sm font-medium text-neutral-700 mb-2.5'>City *</label>
                            <input
                                required
                                onChange={onChangeHandler}
                                name='city'
                                value={formData.city}
                                type='text'
                                placeholder='City'
                                minLength='2'
                                maxLength='50'
                                className='w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-sm'
                            />
                            </div>
                            <div>
                            <label className='block text-sm font-medium text-neutral-700 mb-2.5'>State *</label>
                            <input
                                required
                                onChange={onChangeHandler}
                                name='state'
                                value={formData.state}
                                type='text'
                                placeholder='State'
                                minLength='2'
                                maxLength='50'
                                className='w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-sm'
                            />
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-6'>
                            <div>
                            <label className='block text-sm font-medium text-neutral-700 mb-2.5'>Zipcode *</label>
                            <input
                                required
                                onChange={onChangeHandler}
                                name='zipcode'
                                value={formData.zipcode}
                                type='text'
                                placeholder='6-digit zipcode'
                                pattern='[0-9]{6}'
                                maxLength='6'
                                className='w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-sm'
                            />
                            </div>
                            <div>
                            <label className='block text-sm font-medium text-neutral-700 mb-2.5'>Country *</label>
                            <input
                                required
                                onChange={onChangeHandler}
                                name='country'
                                value={formData.country}
                                type='text'
                                placeholder='Country'
                                minLength='2'
                                maxLength='50'
                                className='w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-sm'
                            />
                            </div>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-neutral-700 mb-2.5'>Phone Number *</label>
                            <div className='flex border border-neutral-200 rounded-xl overflow-hidden focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 transition-all'>
                            <span className='bg-neutral-50 text-neutral-600 text-sm px-4 py-3 border-r border-neutral-200 flex items-center select-none whitespace-nowrap font-medium'>
                                +91
                            </span>
                            <input
                                required
                                onChange={onChangeHandler}
                                name='phone'
                                value={formData.phone}
                                type='tel'
                                placeholder='10-digit mobile number'
                                maxLength={10}
                                pattern='[0-9]{10}'
                                inputMode='numeric'
                                className='py-3 px-4 w-full outline-none text-sm bg-white'
                            />
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>

                    {/* RIGHT - Order Summary + Payment Method */}
                    <div className='w-full lg:w-[400px] flex-shrink-0 sticky top-24 space-y-6'>
                    <div className='bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6'>
                        <h2 className='text-lg font-medium text-neutral-900 mb-6 flex items-center gap-2'>
                        <div className='w-8 h-8 bg-rose-50 rounded-full flex items-center justify-center'>
                            <i className='ri-bill-line text-rose-600 text-sm'></i>
                        </div>
                        Order Summary
                        </h2>
                        <CartTotal />
                    </div>

                    {/* Payment Method Card */}
                    <div className='bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6'>
                        <h2 className='text-lg font-medium text-neutral-900 mb-6 flex items-center gap-2'>
                        <div className='w-8 h-8 bg-rose-50 rounded-full flex items-center justify-center'>
                            <i className='ri-bank-card-line text-rose-600 text-sm'></i>
                        </div>
                        Payment Method
                        </h2>
                        <div className='space-y-3'>
                        <div
                            onClick={() => setMethod('razorpay')}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            method === 'razorpay'
                                ? 'border-rose-600 bg-rose-50/50'
                                : 'border-neutral-200 hover:border-rose-300'
                            }`}
                        >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            method === 'razorpay' ? 'border-rose-600' : 'border-neutral-300'
                            }`}>
                            {method === 'razorpay' && <div className='w-2.5 h-2.5 rounded-full bg-rose-600'></div>}
                            </div>
                            <img className='h-6' src={assets.razorpay_logo} alt='Razorpay' />
                            <span className='text-sm text-neutral-600 ml-auto'>Cards, UPI, NetBanking</span>
                        </div>

                        <div
                            onClick={() => setMethod('cod')}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            method === 'cod'
                                ? 'border-rose-600 bg-rose-50/50'
                                : 'border-neutral-200 hover:border-rose-300'
                            }`}
                        >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            method === 'cod' ? 'border-rose-600' : 'border-neutral-300'
                            }`}>
                            {method === 'cod' && <div className='w-2.5 h-2.5 rounded-full bg-rose-600'></div>}
                            </div>
                            <div className='flex items-center gap-2'>
                            <i className='ri-money-rupee-circle-line text-neutral-600 text-xl'></i>
                            <span className='text-sm font-medium text-neutral-700'>Cash on Delivery</span>
                            </div>
                            <span className='text-sm text-neutral-500 ml-auto'>Pay when delivered</span>
                        </div>
                        </div>
                    </div>

                    <button
                    type='submit'
                    disabled={loading}
                    className='w-full bg-gradient-to-r from-rose-600 to-rose-700 text-white py-4 rounded-xl font-semibold hover:from-rose-700 hover:to-rose-800 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm'
                    >
                    {loading ? (
                        <>
                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                        Processing...
                        </>
                    ) : (
                        <>
                        <i className='ri-shield-check-line'></i>
                        Place Order
                        </>
                    )}
                    </button>
                    <div className='flex items-center gap-2 justify-center pt-4 border-t border-neutral-100'>
                    <i className='ri-lock-line text-neutral-400 text-sm'></i>
                    <p className='text-xs text-neutral-400'>Secured by SSL encryption</p>
                    </div>
                    </div>
                </div>
                </form>
            </div>
            )
}

export default PlaceOrder
