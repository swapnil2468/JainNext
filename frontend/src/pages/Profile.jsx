import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import axios from 'axios'
import { toast } from 'react-toastify'

// API endpoints
const API_ENDPOINTS = {
  USER_PROFILE: '/api/user/profile',
  USER_APPLY_WHOLESALE: '/api/user/apply-wholesale'
};

const ERROR_MESSAGES = {
  SESSION_EXPIRED: 'Session expired. Please login again.',
  PROFILE_LOAD_FAILED: 'Failed to load profile. Please try again.',
  NO_USER_DATA: 'No user data found'
};

const UI_MESSAGES = {
  LOADING_PROFILE: 'Loading profile...'
};

const Profile = () => {

  const { backendUrl, token, navigate, logout } = useContext(ShopContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWholesaleForm, setShowWholesaleForm] = useState(false);
  const [wholesaleFormData, setWholesaleFormData] = useState({
    businessName: '',
    gstNumber: '',
    businessPhone: '',
    businessAddress: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const isAuthErrorMessage = (message = '') => {
    if (!message || typeof message !== 'string') return false;
    const normalizedMessage = message.toLowerCase();
    return normalizedMessage.includes('jwt expired') ||
           normalizedMessage.includes('not authorized') ||
           normalizedMessage.includes('jwt malformed') ||
           normalizedMessage.includes('invalid token');
  }

  const loadUserProfile = async () => {
    try {
      if (!token) {
        navigate('/login')
        return
      }

      const response = await axios.post(backendUrl + API_ENDPOINTS.USER_PROFILE, {}, { headers: { token } })
      
      if (response.data.success) {
        setUserData(response.data.user)
      } else {
        const message = response.data.message || ERROR_MESSAGES.PROFILE_LOAD_FAILED;
        if (isAuthErrorMessage(message)) {
          toast.error(ERROR_MESSAGES.SESSION_EXPIRED);
          logout();
          return;
        }
        toast.error(message)
      }
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      if (isAuthErrorMessage(message)) {
        toast.error(ERROR_MESSAGES.SESSION_EXPIRED);
        logout();
        return;
      }
      toast.error(ERROR_MESSAGES.PROFILE_LOAD_FAILED)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserProfile()
  }, [token])

  const handleWholesaleInputChange = (e) => {
    setWholesaleFormData({ ...wholesaleFormData, [e.target.name]: e.target.value });
  }

  const handleWholesaleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await axios.post(
        backendUrl + API_ENDPOINTS.USER_APPLY_WHOLESALE,
        wholesaleFormData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setShowWholesaleForm(false);
        // Reload profile to show updated status
        loadUserProfile();
      } else {
        const message = response.data.message || 'Failed to submit application';
        if (isAuthErrorMessage(message)) {
          toast.error(ERROR_MESSAGES.SESSION_EXPIRED);
          logout();
          return;
        }
        toast.error(message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      if (isAuthErrorMessage(message)) {
        toast.error(ERROR_MESSAGES.SESSION_EXPIRED);
        logout();
        return;
      }
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 pt-24 px-6 lg:px-8 flex items-center justify-center'>
        <div className='flex flex-col items-center gap-3'>
          <div className='w-10 h-10 border-2 border-neutral-200 border-t-rose-500 rounded-full animate-spin'></div>
          <p className='text-neutral-500'>{UI_MESSAGES.LOADING_PROFILE}</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 pt-24 px-6 lg:px-8 flex items-center justify-center'>
        <p className='text-neutral-500'>{ERROR_MESSAGES.NO_USER_DATA}</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-rose-50/40 via-white to-orange-50/30 pt-24 px-6 lg:px-8 pb-2'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-4xl font-light text-neutral-900'>
          My <span className='font-medium text-rose-600'>Profile</span>
        </h1>
        <div className='w-16 h-0.5 bg-rose-600 mt-2'></div>
      </div>

      <div className='grid lg:grid-cols-3 gap-4 max-w-full'>

        {/* LEFT COLUMN - Profile Card */}
        <div className='lg:col-span-1 space-y-4'>

          {/* Avatar + Name Card */}
          <div className='bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 rounded-2xl shadow-lg p-6 text-center text-white relative overflow-hidden'>
            {/* Decorative circles */}
            <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16'></div>
            <div className='absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12'></div>
            <div className='relative'>
              <div className='w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30'>
                <span className='text-3xl font-light text-white'>
                  {userData.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className='text-xl font-medium text-white'>{userData.name}</h2>
              <p className='text-sm text-rose-200 mt-1'>{userData.email}</p>
              <div className='mt-4 pt-4 border-t border-white/20'>
                <p className='text-xs text-rose-300'>Member Since</p>
                <p className='text-sm font-medium text-white mt-1'>
                  {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  }) : 'Recently'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className='bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6'>
            <h3 className='text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-4'>Quick Actions</h3>
            <div className='space-y-2'>
              <button
                onClick={() => navigate('/orders')}
                className='w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 text-neutral-700 transition-all text-sm font-medium text-left'
              >
                <i className='ri-shopping-bag-line text-lg'></i>
                My Orders
                <i className='ri-arrow-right-s-line ml-auto'></i>
              </button>
              <button
                onClick={() => navigate('/collection')}
                className='w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 text-neutral-700 transition-all text-sm font-medium text-left'
              >
                <i className='ri-store-line text-lg'></i>
                Browse Collection
                <i className='ri-arrow-right-s-line ml-auto'></i>
              </button>
              <button
                onClick={() => navigate('/cart')}
                className='w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 text-neutral-700 transition-all text-sm font-medium text-left'
              >
                <i className='ri-shopping-cart-line text-lg'></i>
                View Cart
                <i className='ri-arrow-right-s-line ml-auto'></i>
              </button>
              <div className='border-t border-neutral-100 pt-2 mt-2'>
                <button
                  onClick={() => logout()}
                  className='w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-100 hover:bg-rose-50 text-rose-500 transition-all text-sm font-medium text-left'
                >
                  <i className='ri-logout-box-line text-lg'></i>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className='lg:col-span-2 space-y-4 flex flex-col'>

          {/* Account Summary Stats */}
          <div className='grid sm:grid-cols-3 gap-4'>
            <div className='bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-100'>
              <div className='flex items-start justify-between'>
                <div>
                  <p className='text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1'>Account Status</p>
                  <p className='text-lg font-semibold text-neutral-900 capitalize'>{userData.role || 'Retail'}</p>
                </div>
                <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-user-star-line text-blue-600'></i>
                </div>
              </div>
            </div>

            <div className='bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-100'>
              <div className='flex items-start justify-between'>
                <div>
                  <p className='text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1'>Member Since</p>
                  <p className='text-lg font-semibold text-neutral-900'>
                    {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { year: 'numeric' }) : 'Recently'}
                  </p>
                </div>
                <div className='w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-calendar-line text-purple-600'></i>
                </div>
              </div>
            </div>

            <div className='bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-100'>
              <div className='flex items-start justify-between'>
                <div>
                  <p className='text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1'>Account Active</p>
                  <p className='text-lg font-semibold text-green-600'>✓ Verified</p>
                </div>
                <div className='w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-check-double-line text-green-600'></i>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information Card */}
          <div className='bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6'>
            <h3 className='text-lg font-light text-neutral-900 mb-3 flex items-center gap-2'>
              <div className='w-1 h-6 bg-rose-600 rounded-full'></div>
              Account <span className='font-medium'>Information</span>
            </h3>
            <div className='grid sm:grid-cols-2 gap-6'>
              <div className='bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-xl p-4 border border-rose-100'>
                <p className='text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1'>Full Name</p>
                <p className='text-neutral-900 font-medium'>{userData.name}</p>
              </div>
              <div className='bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-xl p-4 border border-orange-100'>
                <p className='text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1'>Email Address</p>
                <p className='text-neutral-900 font-medium'>{userData.email}</p>
              </div>
              <div className='bg-gradient-to-br from-neutral-50 to-neutral-100/50 rounded-xl p-4 border border-neutral-100'>
                <p className='text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1'>Account Type</p>
                <p className='text-neutral-900 font-medium capitalize'>{userData.role || 'Retail'}</p>
              </div>
              <div className='bg-gradient-to-br from-rose-50 to-pink-50/50 rounded-xl p-4 border border-rose-100'>
                <p className='text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1'>Member Since</p>
                <p className='text-neutral-900 font-medium'>
                  {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  }) : 'Recently'}
                </p>
              </div>
            </div>
          </div>

          {/* Wholesale Section */}
          {userData.role === 'retail' ? (
            <div className='bg-white rounded-2xl border border-rose-100 shadow-sm p-6 relative overflow-hidden flex flex-col flex-1'>
              <div className='absolute top-0 right-0 w-40 h-40 bg-rose-50 rounded-full -translate-y-20 translate-x-20'></div>
              <div className='relative flex-1 flex flex-col'>
              <div className='flex items-start gap-4 mb-6'>
                <div className='w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0'>
                  <i className='ri-store-2-line text-rose-600 text-xl'></i>
                </div>
                <div>
                  <h3 className='text-lg font-medium text-neutral-900'>Interested in Wholesale?</h3>
                  <p className='text-sm text-neutral-500 mt-1'>Apply for a wholesale account to access special pricing and bulk order discounts.</p>
                </div>
              </div>

              {!showWholesaleForm ? (
                <button
                  onClick={() => navigate('/wholesale')}
                  className='mt-auto bg-gradient-to-r from-rose-600 to-rose-700 text-white px-6 py-3 text-sm font-medium rounded-xl hover:from-rose-700 hover:to-rose-800 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5'
                >
                  <i className='ri-store-2-line mr-2'></i>
                  Apply for Wholesale Account
                </button>
              ) : (
                <form onSubmit={handleWholesaleSubmit} className='space-y-4 mt-auto'>
                  <div className='grid sm:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-neutral-700 mb-2'>Business Name *</label>
                      <input
                        type='text'
                        name='businessName'
                        value={wholesaleFormData.businessName}
                        onChange={handleWholesaleInputChange}
                        required
                        className='w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all'
                        placeholder='Your business name'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-neutral-700 mb-2'>GST Number *</label>
                      <input
                        type='text'
                        name='gstNumber'
                        value={wholesaleFormData.gstNumber}
                        onChange={handleWholesaleInputChange}
                        required
                        className='w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all'
                        placeholder='GST number'
                      />
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-neutral-700 mb-2'>Business Phone *</label>
                    <input
                      type='tel'
                      name='businessPhone'
                      value={wholesaleFormData.businessPhone}
                      onChange={handleWholesaleInputChange}
                      required
                      className='w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all'
                      placeholder='Business phone number'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-neutral-700 mb-2'>Business Address *</label>
                    <textarea
                      name='businessAddress'
                      value={wholesaleFormData.businessAddress}
                      onChange={handleWholesaleInputChange}
                      required
                      rows='3'
                      className='w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all resize-none'
                      placeholder='Full business address'
                    />
                  </div>
                  <div className='flex gap-3'>
                    <button
                      type='submit'
                      disabled={submitting}
                      className='bg-gradient-to-r from-rose-600 to-rose-700 text-white px-6 py-3 text-sm font-medium rounded-xl hover:from-rose-700 hover:to-rose-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                    <button
                      type='button'
                      onClick={() => setShowWholesaleForm(false)}
                      className='px-6 py-3 text-sm font-medium rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all'
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
              </div>
            </div>
          ) : userData.role === 'wholesale' && userData.isRejected ? (
            <div className='bg-white rounded-2xl border border-orange-200 shadow-sm p-6 relative overflow-hidden'>
              <div className='absolute top-0 right-0 w-40 h-40 bg-orange-50 rounded-full -translate-y-20 translate-x-20'></div>
              <div className='relative'>
                <div className='flex items-start gap-4 mb-4'>
                  <div className='w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0'>
                    <i className='ri-close-circle-line text-orange-500 text-xl'></i>
                  </div>
                  <div>
                    <h3 className='text-lg font-medium text-neutral-900'>Application Rejected</h3>
                    <p className='text-sm text-neutral-500 mt-1'>Your wholesale application has been rejected. Please review your information and try again.</p>
                  </div>
                </div>
                <div className='bg-orange-50 rounded-xl p-4 space-y-2 text-sm'>
                  <p><span className='text-neutral-500'>Business Name:</span> <span className='font-medium text-neutral-900'>{userData.businessName}</span></p>
                  <p><span className='text-neutral-500'>GST Number:</span> <span className='font-medium text-neutral-900'>{userData.gstNumber}</span></p>
                </div>
              </div>
            </div>
          ) : userData.role === 'wholesale' && !userData.isApproved ? (
            <div className='bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 relative overflow-hidden'>
              <div className='absolute top-0 right-0 w-40 h-40 bg-neutral-50 rounded-full -translate-y-20 translate-x-20'></div>
              <div className='relative'>
                <div className='flex items-start gap-4 mb-4'>
                  <div className='w-12 h-12 bg-neutral-50 rounded-xl flex items-center justify-center flex-shrink-0'>
                    <i className='ri-time-line text-neutral-400 text-xl'></i>
                  </div>
                  <div>
                    <h3 className='text-lg font-medium text-neutral-900'>Application Under Review</h3>
                    <p className='text-sm text-neutral-500 mt-1'>Your wholesale account application is under review. You'll be notified once approved.</p>
                  </div>
                </div>
                <div className='bg-neutral-50 rounded-xl p-4 space-y-2 text-sm'>
                  <p><span className='text-neutral-500'>Business Name:</span> <span className='font-medium text-neutral-900'>{userData.businessName}</span></p>
                  <p><span className='text-neutral-500'>GST Number:</span> <span className='font-medium text-neutral-900'>{userData.gstNumber}</span></p>
                </div>
              </div>
            </div>
          ) : userData.role === 'wholesale' && userData.isApproved ? (
            <div className='bg-white rounded-2xl border border-green-200 shadow-sm p-6 relative overflow-hidden'>
              <div className='absolute top-0 right-0 w-40 h-40 bg-green-50 rounded-full -translate-y-20 translate-x-20'></div>
              <div className='relative'>
                <div className='flex items-start gap-4 mb-4'>
                  <div className='w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0'>
                    <i className='ri-checkbox-circle-line text-green-600 text-xl'></i>
                  </div>
                  <div>
                    <h3 className='text-lg font-medium text-neutral-900'>Wholesale Account Active</h3>
                    <p className='text-sm text-neutral-500 mt-1'>Your wholesale account is active. You can now see wholesale pricing on eligible products.</p>
                  </div>
                </div>
                <div className='bg-green-50 rounded-xl p-4 space-y-2 text-sm'>
                  <p><span className='text-neutral-500'>Business Name:</span> <span className='font-medium text-neutral-900'>{userData.businessName}</span></p>
                  <p><span className='text-neutral-500'>GST Number:</span> <span className='font-medium text-neutral-900'>{userData.gstNumber}</span></p>
                  <p><span className='text-neutral-500'>Business Phone:</span> <span className='font-medium text-neutral-900'>{userData.businessPhone}</span></p>
                </div>
              </div>
            </div>
          ) : null}

        </div>
      </div>
    </div>
  )
}

export default Profile
