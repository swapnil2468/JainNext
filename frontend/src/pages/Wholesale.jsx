import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import axios from 'axios'
import { toast } from 'react-toastify'

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
      toast.error('Please login to apply for wholesale');
      navigate('/login');
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(
        backendUrl + '/api/user/apply-wholesale',
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
      console.error('Error applying for wholesale:', error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className='border-t pt-16'>
      {/* Hero Section */}
      <div className='bg-gradient-to-br from-red-600 via-red-700 to-black text-white py-16 px-8 rounded-xl shadow-2xl mb-12 relative overflow-hidden'>
        <div className='absolute inset-0 bg-black opacity-10'></div>
        <div className='max-w-4xl mx-auto text-center relative z-10'>
          <div className='mb-4'>
            <span className='bg-white text-red-600 px-4 py-2 rounded-full text-sm font-bold tracking-wide'>BUSINESS SOLUTIONS</span>
          </div>
          <h1 className='text-4xl md:text-5xl font-bold mb-4'>Wholesale Pricing for Your Business</h1>
          <p className='text-xl md:text-2xl mb-6'>Get exclusive bulk order discounts and special pricing</p>
          <p className='text-lg opacity-90'>Join hundreds of businesses already saving with our wholesale program</p>
        </div>
      </div>

      <div className='max-w-6xl mx-auto'>
        {/* Benefits Section */}
        <div className='mb-16'>
          <div className='text-center mb-10'>
            <Title text1={'WHOLESALE'} text2={'BENEFITS'} />
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-red-500 hover:shadow-lg transition-all group'>
              <div className='text-4xl mb-4'>💰</div>
              <h3 className='text-xl font-semibold mb-3 group-hover:text-red-600 transition-colors'>Exclusive Pricing</h3>
              <p className='text-gray-600'>Get up to 20-40% off retail prices on bulk orders. The more you buy, the more you save.</p>
            </div>
            
            <div className='bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-red-500 hover:shadow-lg transition-all group'>
              <div className='text-4xl mb-4'>🚚</div>
              <h3 className='text-xl font-semibold mb-3 group-hover:text-red-600 transition-colors'>Priority Shipping</h3>
              <p className='text-gray-600'>Free shipping on orders above ₹1499 with priority processing for wholesale customers.</p>
            </div>
            
            <div className='bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-red-500 hover:shadow-lg transition-all group'>
              <div className='text-4xl mb-4'>🤝</div>
              <h3 className='text-xl font-semibold mb-3 group-hover:text-red-600 transition-colors'>Dedicated Support</h3>
              <p className='text-gray-600'>Personal account manager to assist with orders, product selection, and business growth.</p>
            </div>
            
            <div className='bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-red-500 hover:shadow-lg transition-all group'>
              <div className='text-4xl mb-4'>📦</div>
              <h3 className='text-xl font-semibold mb-3 group-hover:text-red-600 transition-colors'>Bulk Order Discounts</h3>
              <p className='text-gray-600'>Special tiered pricing for large volume orders. Minimum order quantities that make sense for your business.</p>
            </div>
            
            <div className='bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-red-500 hover:shadow-lg transition-all group'>
              <div className='text-4xl mb-4'>⚡</div>
              <h3 className='text-xl font-semibold mb-3 group-hover:text-red-600 transition-colors'>Fast Approval</h3>
              <p className='text-gray-600'>Quick application review process. Most applications approved within 24-48 hours.</p>
            </div>
            
            <div className='bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-red-500 hover:shadow-lg transition-all group'>
              <div className='text-4xl mb-4'>🔄</div>
              <h3 className='text-xl font-semibold mb-3 group-hover:text-red-600 transition-colors'>Flexible Terms</h3>
              <p className='text-gray-600'>Payment options and credit terms available for established businesses.</p>
            </div>
          </div>
        </div>

        {/* Who Can Apply Section */}
        <div className='mb-16 bg-gray-50 p-8 rounded-lg'>
          <h2 className='text-2xl font-bold text-center mb-6'>Who Can Apply?</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto'>
            <div className='flex items-start gap-3'>
              <span className='text-green-600 text-xl'>✓</span>
              <p className='text-gray-700'>Retail stores and showrooms</p>
            </div>
            <div className='flex items-start gap-3'>
              <span className='text-green-600 text-xl'>✓</span>
              <p className='text-gray-700'>Event planners and decorators</p>
            </div>
            <div className='flex items-start gap-3'>
              <span className='text-green-600 text-xl'>✓</span>
              <p className='text-gray-700'>Online resellers and e-commerce stores</p>
            </div>
            <div className='flex items-start gap-3'>
              <span className='text-green-600 text-xl'>✓</span>
              <p className='text-gray-700'>Corporate buyers and bulk purchasers</p>
            </div>
            <div className='flex items-start gap-3'>
              <span className='text-green-600 text-xl'>✓</span>
              <p className='text-gray-700'>Wedding planners and designers</p>
            </div>
            <div className='flex items-start gap-3'>
              <span className='text-green-600 text-xl'>✓</span>
              <p className='text-gray-700'>Hotels and hospitality businesses</p>
            </div>
          </div>
        </div>

        {/* Application Form Section */}
        <div className='mb-16 max-w-2xl mx-auto'>
          <div className='text-center mb-8'>
            <Title text1={'APPLY FOR'} text2={'WHOLESALE ACCOUNT'} />
            <p className='text-gray-600 mt-4'>Fill out the form below and we'll review your application within 24-48 hours</p>
          </div>

          {userProfile?.role === 'wholesale' && userProfile?.isApproved ? (
            <div className='bg-gradient-to-br from-green-50 to-white border-2 border-green-400 p-8 rounded-xl text-center shadow-lg'>
              <div className='text-6xl mb-4'>🎉</div>
              <h3 className='text-2xl font-semibold text-gray-900 mb-2'>You're Already Approved!</h3>
              <p className='text-gray-700 mb-6'>Your wholesale account is active and you can enjoy wholesale pricing on eligible products.</p>
              <button 
                onClick={() => navigate('/collection')}
                className='bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-md'
              >
                Start Shopping
              </button>
            </div>
          ) : userProfile?.role === 'wholesale' && !userProfile?.isApproved ? (
            <div className='bg-orange-50 border border-orange-200 p-8 rounded-lg text-center'>
              <div className='text-6xl mb-4'>⏳</div>
              <h3 className='text-2xl font-semibold text-orange-900 mb-2'>Application Under Review</h3>
              <p className='text-gray-700 mb-4'>Your wholesale application is being reviewed. You'll be notified once approved.</p>
              <p className='text-sm text-gray-600'>Expected approval time: 24-48 hours</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='bg-white p-8 rounded-xl border-2 border-gray-200 shadow-lg'>
              <div className='space-y-5'>
                <div>
                  <label className='block text-sm font-semibold text-gray-800 mb-2'>Business Name *</label>
                  <input
                    type='text'
                    name='businessName'
                    value={wholesaleFormData.businessName}
                    onChange={handleInputChange}
                    required
                    placeholder='Enter your business name'
                    className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all'
                  />
                </div>
                
                <div>
                  <label className='block text-sm font-semibold text-gray-800 mb-2'>GST Number *</label>
                  <input
                    type='text'
                    name='gstNumber'
                    value={wholesaleFormData.gstNumber}
                    onChange={handleInputChange}
                    required
                    placeholder='Enter GST number (e.g., 22AAAAA0000A1Z5)'
                    className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all'
                  />
                </div>
                
                <div>
                  <label className='block text-sm font-semibold text-gray-800 mb-2'>Business Phone *</label>
                  <input
                    type='tel'
                    name='businessPhone'
                    value={wholesaleFormData.businessPhone}
                    onChange={handleInputChange}
                    required
                    placeholder='Enter business phone number'
                    className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all'
                  />
                </div>
                
                <div>
                  <label className='block text-sm font-semibold text-gray-800 mb-2'>Business Address *</label>
                  <textarea
                    name='businessAddress'
                    value={wholesaleFormData.businessAddress}
                    onChange={handleInputChange}
                    required
                    rows='4'
                    placeholder='Enter complete business address'
                    className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all'
                  />
                </div>
                
                <button
                  type='submit'
                  disabled={submitting}
                  className='w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-lg font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-[1.02]'
                >
                  {submitting ? 'Submitting Application...' : 'Submit Wholesale Application'}
                </button>
                
                <p className='text-xs text-gray-500 text-center'>
                  By submitting this form, you agree to our terms and conditions for wholesale customers.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* FAQ Section */}
        <div className='mb-16 bg-gray-50 p-8 rounded-lg'>
          <h2 className='text-2xl font-bold text-center mb-8'>Frequently Asked Questions</h2>
          <div className='max-w-3xl mx-auto space-y-6'>
            <div>
              <h3 className='font-semibold text-lg mb-2'>What is the minimum order quantity?</h3>
              <p className='text-gray-600'>Minimum order quantities vary by product, typically starting from 10 units. Check individual product pages for specific MOQs.</p>
            </div>
            <div>
              <h3 className='font-semibold text-lg mb-2'>How much can I save with wholesale pricing?</h3>
              <p className='text-gray-600'>Savings typically range from 20% to 40% off retail prices, depending on product and order volume.</p>
            </div>
            <div>
              <h3 className='font-semibold text-lg mb-2'>How long does approval take?</h3>
              <p className='text-gray-600'>Most applications are reviewed and approved within 24-48 hours during business days.</p>
            </div>
            <div>
              <h3 className='font-semibold text-lg mb-2'>Can I see wholesale prices before applying?</h3>
              <p className='text-gray-600'>Wholesale prices are only visible to approved wholesale customers to maintain pricing integrity.</p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className='bg-gradient-to-r from-black via-gray-900 to-red-900 text-white p-10 rounded-xl text-center mb-16 shadow-2xl'>
          <h2 className='text-2xl md:text-3xl font-bold mb-3'>Have Questions About Wholesale?</h2>
          <p className='text-lg mb-6 opacity-90'>Our wholesale team is here to help you get started</p>
          <button 
            onClick={() => navigate('/contact')}
            className='bg-white text-red-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all shadow-lg transform hover:scale-105'
          >
            Contact Us
          </button>
        </div>
      </div>
    </div>
  )
}

export default Wholesale
