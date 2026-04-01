import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import axios from 'axios'
import { toast } from 'react-toastify'

// API endpoints
const API_ENDPOINTS = {
  USER_APPLY_WHOLESALE: '/api/user/apply-wholesale'
};

const ERROR_MESSAGES = {
  NOT_LOGGED_IN: 'Please login to apply for wholesale'
};

const Wholesale = () => {
  const { backendUrl, token, navigate, userProfile, products, currency } = useContext(ShopContext);
  const [wholesaleFormData, setWholesaleFormData] = useState({
    businessName: '',
    gstNumber: '',
    businessPhone: '',
    businessAddress: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Get up to 8 products that have wholesale price set
  const wholesaleProducts = products
    .filter(p => {
      // For variant products check if any variant has wholesale price
      if (p.variants && p.variants.length > 0) {
        return p.variants.some(v => v.wholesalePrice)
      }
      // For non-variant products check wholesalePrice field
      return p.wholesalePrice
    })
    .slice(0, 8)

  const handleInputChange = (e) => {
    setWholesaleFormData({ ...wholesaleFormData, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error(ERROR_MESSAGES.NOT_LOGGED_IN);
      navigate('/login');
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(
        backendUrl + API_ENDPOINTS.USER_APPLY_WHOLESALE,
        wholesaleFormData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Reset form and show state
        setWholesaleFormData({
          businessName: '',
          gstNumber: '',
          businessPhone: '',
          businessAddress: ''
        });
        setShowForm(false);
        // Give a moment for the toast to display
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
      <div className='min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50'>

        {/* Hero Section */}
        <div className='relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-rose-50/60 via-rose-50/20 to-orange-50/30'>
          {/* Subtle blur circles */}
          <div className='absolute top-0 left-1/4 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl pointer-events-none'></div>
          <div className='absolute bottom-0 right-1/4 w-96 h-96 bg-orange-200/15 rounded-full blur-3xl pointer-events-none'></div>

          <div className='relative text-center max-w-4xl mx-auto'>
            <span className='inline-block bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-rose-200'>
              Business Solutions
            </span>
            <h1 className='text-4xl md:text-6xl font-light text-neutral-900 mb-6'>
              Wholesale Pricing for <span className='font-medium text-rose-600'>Your Business</span>
            </h1>
            <p className='text-xl text-neutral-600 mb-4'>Get exclusive bulk order discounts and special pricing</p>
            <p className='text-lg text-neutral-500'>Join hundreds of businesses already saving with our wholesale program</p>

            {/* Stats bar */}
            <div className='flex flex-wrap justify-center gap-8 mt-12 pt-12 border-t border-neutral-200'>
              <div className='text-center'>
                <p className='text-3xl font-light text-rose-600'>500+</p>
                <p className='text-sm text-neutral-500 mt-1'>Business Partners</p>
              </div>
              <div className='text-center'>
                <p className='text-3xl font-light text-rose-600'>40%</p>
                <p className='text-sm text-neutral-500 mt-1'>Average Savings</p>
              </div>
              <div className='text-center'>
                <p className='text-3xl font-light text-rose-600'>24/7</p>
                <p className='text-sm text-neutral-500 mt-1'>Dedicated Support</p>
              </div>
              <div className='text-center'>
                <p className='text-3xl font-light text-rose-600'>24hr</p>
                <p className='text-sm text-neutral-500 mt-1'>Fast Approval</p>
              </div>
            </div>
          </div>
        </div>

        <div className='py-20 px-6 lg:px-8'>
          <div className='w-full'>

            {/* Benefits Section */}
            <div className='mb-20 bg-white py-20 px-6 lg:px-8 -mx-6 lg:-mx-8'>
              <div className='text-center mb-12'>
                <h2 className='text-4xl font-light text-neutral-900'>Wholesale <span className='font-medium text-rose-600'>Benefits</span></h2>
                <div className='w-16 h-0.5 bg-rose-600 mx-auto mt-3'></div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {[
                  { icon: 'ri-price-tag-3-line', title: 'Exclusive Pricing', desc: 'Get up to 20-40% off retail prices on bulk orders. The more you buy, the more you save.' },
                  { icon: 'ri-truck-line', title: 'Priority Shipping', desc: 'Free shipping on orders above ₹1499 with priority processing for wholesale customers.' },
                  { icon: 'ri-customer-service-2-line', title: 'Dedicated Support', desc: 'Personal account manager to assist with orders, product selection, and business growth.' },
                  { icon: 'ri-stack-line', title: 'Bulk Order Discounts', desc: 'Special tiered pricing for large volume orders. Minimum order quantities that make sense for your business.' },
                  { icon: 'ri-flashlight-line', title: 'Fast Approval', desc: 'Quick application review process. Most applications approved within 24-48 hours.' },
                  { icon: 'ri-refresh-line', title: 'Flexible Terms', desc: 'Payment options and credit terms available for established businesses.' }
                ].map((benefit, i) => (
                  <div key={i} className='group bg-white rounded-2xl p-6 border border-neutral-200/60 shadow-sm hover:shadow-xl hover:shadow-rose-900/10 hover:-translate-y-1 hover:border-rose-200 transition-all duration-300'>
                    <div className='w-12 h-12 bg-gradient-to-br from-rose-100 to-rose-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300'>
                      <i className={`${benefit.icon} text-rose-600 text-xl`}></i>
                    </div>
                    <h3 className='text-lg font-medium text-neutral-900 mb-2 group-hover:text-rose-600 transition-colors'>{benefit.title}</h3>
                    <p className='text-neutral-600 text-sm leading-relaxed'>{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Savings Showcase */}
            {wholesaleProducts.length > 0 && (
              <div className='mb-20'>
                <div className='text-center mb-12'>
                  <h2 className='text-4xl font-light text-neutral-900'>
                    See Your <span className='font-medium text-rose-600'>Savings</span>
                  </h2>
                  <div className='w-16 h-0.5 bg-rose-600 mx-auto mt-3 mb-3'></div>
                  <p className='text-neutral-600'>Real products with real savings — apply for wholesale to unlock these prices</p>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                  {wholesaleProducts.map((product, i) => {
                    // Get prices based on variant or non-variant
                    const firstVariant = product.variants && product.variants.length > 0
                      ? product.variants.find(v => v.wholesalePrice) || product.variants[0]
                      : null

                    const retailPrice = firstVariant?.price || product.retailPrice || product.price
                    const wholesalePrice = firstVariant?.wholesalePrice || product.wholesalePrice
                    const displayImage = firstVariant?.images?.[0] || product.image?.[0]
                    const savings = retailPrice - wholesalePrice
                    const savingsPercent = Math.round((savings / retailPrice) * 100)
                    const minQty = product.minimumWholesaleQuantity || 10

                    return (
                      <div
                        key={i}
                        onClick={() => { navigate(`/product/${product.slug || product._id}`); window.scrollTo(0, 0) }}
                        className='group bg-white rounded-2xl border border-neutral-200/60 overflow-hidden hover:shadow-xl hover:shadow-rose-900/10 hover:-translate-y-1 hover:border-rose-200 transition-all duration-300 cursor-pointer'
                      >
                        {/* Product Image */}
                        <div className='relative aspect-square overflow-hidden bg-neutral-50'>
                          <img
                            src={displayImage}
                            alt={product.name}
                            className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                            loading='lazy'
                          />
                          {/* Savings Badge */}
                          <div className='absolute top-3 right-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg'>
                            Save {savingsPercent}%
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className='p-4'>
                          <p className='font-medium text-neutral-900 text-sm line-clamp-2 mb-3'>{product.name}</p>

                          {/* Price Comparison */}
                          <div className='space-y-1.5 mb-3'>
                            <div className='flex items-center justify-between'>
                              <span className='text-xs text-neutral-500'>Retail Price</span>
                              <span className='text-sm text-neutral-400 line-through'>{currency}{retailPrice}</span>
                            </div>
                            <div className='flex items-center justify-between'>
                              <span className='text-xs font-semibold text-green-700'>Wholesale Price</span>
                              <span className='text-sm font-bold text-green-700'>{currency}{wholesalePrice}</span>
                            </div>
                            <div className='flex items-center justify-between pt-1.5 border-t border-neutral-100'>
                              <span className='text-xs text-rose-600 font-medium'>You Save</span>
                              <span className='text-sm font-bold text-rose-600'>{currency}{savings} per unit</span>
                            </div>
                          </div>

                          {/* Min Qty */}
                          <div className='bg-neutral-50 rounded-lg px-3 py-2 flex items-center justify-between'>
                            <span className='text-xs text-neutral-500'>Min. Order</span>
                            <span className='text-xs font-semibold text-neutral-700'>{minQty} units</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* CTA below products */}
                <div className='text-center mt-10'>
                  <p className='text-neutral-600 mb-4 text-sm'>
                    These are just a few examples — wholesale pricing applies across our entire catalog
                  </p>
                  <button
                    onClick={() => { navigate('/collection'); window.scrollTo(0, 0) }}
                    className='px-6 py-3 border-2 border-rose-600 text-rose-600 rounded-full text-sm font-medium hover:bg-rose-50 transition-all'
                  >
                    Browse Full Collection
                  </button>
                </div>
              </div>
            )}

            {/* Who Can Apply */}
            <div className='mb-20 bg-gradient-to-br from-rose-50/60 to-orange-50/30 rounded-3xl p-10 border border-rose-100 shadow-sm'>
              <h2 className='text-3xl font-light text-neutral-900 text-center mb-10'>Who Can <span className='font-medium text-rose-600'>Apply?</span></h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto'>
                {[
                  'Retail stores and showrooms',
                  'Event planners and decorators',
                  'Online resellers and e-commerce stores',
                  'Corporate buyers and bulk purchasers',
                  'Wedding planners and designers',
                  'Hotels and hospitality businesses'
                ].map((item, i) => (
                  <div key={i} className='flex items-center gap-3 bg-white rounded-xl p-4 border border-neutral-100 shadow-sm'>
                    <div className='w-8 h-8 bg-rose-50 rounded-full flex items-center justify-center flex-shrink-0'>
                      <i className='ri-check-line text-rose-600'></i>
                    </div>
                    <p className='text-neutral-700 text-sm font-medium'>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Form */}
            <div className='bg-gradient-to-b from-white to-rose-50/20 py-16 px-6 lg:px-8 -mx-6 lg:-mx-8 mb-0'>
              <div className='max-w-2xl mx-auto'>
              <div className='text-center mb-10'>
                <h2 className='text-4xl font-light text-neutral-900'>Apply for <span className='font-medium text-rose-600'>Wholesale</span></h2>
                <div className='w-16 h-0.5 bg-rose-600 mx-auto mt-3 mb-4'></div>
                <p className='text-neutral-600'>Fill out the form below and we'll review your application within 24-48 hours</p>
              </div>

              {userProfile?.role === 'wholesale' && userProfile?.isRejected && !showForm ? (
                <div className='bg-white rounded-2xl border border-orange-200 shadow-sm p-10 text-center'>
                  <div className='w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <i className='ri-close-circle-line text-orange-500 text-4xl'></i>
                  </div>
                  <h3 className='text-2xl font-light text-neutral-900 mb-2'>Application <span className='font-medium text-orange-600'>Rejected</span></h3>
                  <p className='text-neutral-600 mb-8'>Your wholesale application has been rejected. Please review your information and try again.</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className='bg-gradient-to-r from-orange-600 to-orange-700 text-white px-8 py-4 rounded-full font-medium hover:from-orange-700 hover:to-orange-800 transition-all hover:shadow-lg hover:-translate-y-0.5'
                  >
                    Review & Reapply
                  </button>
                </div>
              ) : userProfile?.role === 'wholesale' && userProfile?.isApproved ? (
                <div className='bg-white rounded-2xl border border-green-200 shadow-sm p-10 text-center'>
                  <div className='w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <i className='ri-checkbox-circle-line text-green-600 text-4xl'></i>
                  </div>
                  <h3 className='text-2xl font-light text-neutral-900 mb-2'>You're Already <span className='font-medium text-green-600'>Approved!</span></h3>
                  <p className='text-neutral-600 mb-8'>Your wholesale account is active and you can enjoy wholesale pricing on eligible products.</p>
                  <button
                    onClick={() => navigate('/collection')}
                    className='bg-gradient-to-r from-rose-600 to-rose-700 text-white px-8 py-4 rounded-full font-medium hover:from-rose-700 hover:to-rose-800 transition-all hover:shadow-lg hover:-translate-y-0.5'
                  >
                    Start Shopping
                  </button>
                </div>
              ) : userProfile?.role === 'wholesale' && !userProfile?.isApproved && !showForm ? (
                <div className='bg-white rounded-2xl border border-neutral-200 shadow-sm p-10 text-center'>
                  <div className='w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <i className='ri-time-line text-neutral-400 text-4xl'></i>
                  </div>
                  <h3 className='text-2xl font-light text-neutral-900 mb-2'>Application <span className='font-medium'>Under Review</span></h3>
                  <p className='text-neutral-600 mb-2'>Your wholesale application is being reviewed. You'll be notified once approved.</p>
                  <p className='text-sm text-neutral-400'>Expected approval time: 24-48 hours</p>
                </div>
              ) : (
                <div className='bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-8'>
                  <form onSubmit={handleSubmit} className='space-y-5'>
                    <div className='grid sm:grid-cols-2 gap-5'>
                      <div>
                        <label className='block text-sm font-medium text-neutral-700 mb-2'>Business Name *</label>
                        <input
                          type='text'
                          name='businessName'
                          value={wholesaleFormData.businessName}
                          onChange={handleInputChange}
                          required
                          placeholder='Your business name'
                          className='w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-neutral-700 mb-2'>GST Number *</label>
                        <input
                          type='text'
                          name='gstNumber'
                          value={wholesaleFormData.gstNumber}
                          onChange={handleInputChange}
                          required
                          placeholder='22AAAAA0000A1Z5'
                          className='w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all'
                        />
                      </div>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-neutral-700 mb-2'>Business Phone *</label>
                      <input
                        type='tel'
                        name='businessPhone'
                        value={wholesaleFormData.businessPhone}
                        onChange={handleInputChange}
                        required
                        placeholder='Business phone number'
                        className='w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-neutral-700 mb-2'>Business Address *</label>
                      <textarea
                        name='businessAddress'
                        value={wholesaleFormData.businessAddress}
                        onChange={handleInputChange}
                        required
                        rows='4'
                        placeholder='Complete business address'
                        className='w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all resize-none'
                      />
                    </div>
                    <button
                      type='submit'
                      disabled={submitting}
                      className='w-full bg-gradient-to-r from-rose-600 to-rose-700 text-white py-4 rounded-xl font-medium text-sm hover:from-rose-700 hover:to-rose-800 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {submitting ? 'Submitting Application...' : 'Submit Wholesale Application'}
                    </button>
                    {showForm && userProfile?.role === 'wholesale' && userProfile?.isRejected && (
                      <button
                        type='button'
                        onClick={() => setShowForm(false)}
                        className='w-full bg-neutral-200 text-neutral-700 py-4 rounded-xl font-medium text-sm hover:bg-neutral-300 transition-all'
                      >
                        Go Back
                      </button>
                    )}
                    <p className='text-xs text-neutral-400 text-center'>
                      By submitting this form, you agree to our terms and conditions for wholesale customers.
                    </p>
                  </form>
                </div>
              )}
              </div>
            </div>

            {/* FAQ Section */}
            <div className='mb-20 bg-gradient-to-br from-neutral-50 to-white rounded-3xl p-10'>
              <div className='text-center mb-10'>
                <h2 className='text-4xl font-light text-neutral-900'>Frequently Asked <span className='font-medium text-rose-600'>Questions</span></h2>
                <div className='w-16 h-0.5 bg-rose-600 mx-auto mt-3'></div>
              </div>
              <div className='max-w-3xl mx-auto space-y-4'>
                {[
                  { q: 'What is the minimum order quantity?', a: 'Minimum order quantities vary by product, typically starting from 10 units. Check individual product pages for specific MOQs.' },
                  { q: 'How much can I save with wholesale pricing?', a: 'Savings typically range from 20% to 40% off retail prices, depending on product and order volume.' },
                  { q: 'How long does approval take?', a: 'Most applications are reviewed and approved within 24-48 hours during business days.' },
                  { q: 'Can I see wholesale prices before applying?', a: 'Wholesale prices are only visible to approved wholesale customers to maintain pricing integrity.' }
                ].map((faq, i) => (
                  <div key={i} className='bg-white rounded-2xl border border-neutral-200/60 p-6 hover:border-rose-200 hover:shadow-md transition-all duration-300'>
                    <h3 className='font-medium text-neutral-900 mb-2 flex items-center gap-2'>
                      <span className='w-6 h-6 bg-rose-50 rounded-full flex items-center justify-center flex-shrink-0 text-xs text-rose-600 font-bold'>{i + 1}</span>
                      {faq.q}
                    </h3>
                    <p className='text-neutral-600 text-sm leading-relaxed pl-8'>{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact CTA */}
            <div className='w-full bg-gradient-to-br from-rose-700 to-rose-600 rounded-3xl p-12 text-center relative overflow-hidden mb-8'>
              <div className='absolute inset-0 opacity-10'>
                <div className='absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl'></div>
                <div className='absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl'></div>
              </div>
              <div className='relative'>
                <h2 className='text-3xl font-light text-white mb-3'>Have Questions About <span className='font-medium'>Wholesale?</span></h2>
                <p className='text-rose-100 mb-8'>Our wholesale team is here to help you get started</p>
                <button
                  onClick={() => navigate('/contact')}
                  className='px-8 py-4 bg-white text-rose-700 text-sm font-medium rounded-full hover:bg-rose-50 transition-all hover:shadow-xl hover:-translate-y-0.5'
                >
                  Contact Us
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    )
}

export default Wholesale
