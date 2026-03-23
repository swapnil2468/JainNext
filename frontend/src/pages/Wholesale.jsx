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
  const { backendUrl, token, navigate, userProfile } = useContext(ShopContext);
  const [wholesaleFormData, setWholesaleFormData] = useState({
    businessName: '',
    gstNumber: '',
    businessPhone: '',
    businessAddress: ''
  });
  const [submitting, setSubmitting] = useState(false);

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
        setTimeout(() => {
          navigate('/profile');
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
        <div className='relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-rose-50/40 via-white to-orange-50/30'>
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

              {userProfile?.role === 'wholesale' && userProfile?.isApproved ? (
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
              ) : userProfile?.role === 'wholesale' && !userProfile?.isApproved ? (
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
