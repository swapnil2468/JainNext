import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import axios from 'axios'
import { toast } from 'react-toastify'

const Profile = () => {

  const { backendUrl, token, navigate, userProfile } = useContext(ShopContext);
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

  const loadUserProfile = async () => {
    try {
      if (!token) {
        navigate('/login')
        return
      }

      const response = await axios.post(backendUrl + '/api/user/profile', {}, { headers: { token } })
      
      if (response.data.success) {
        setUserData(response.data.user)
      } else {
        toast.error(response.data.message || 'Failed to load profile')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile. Please try again.')
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
        backendUrl + '/api/user/apply-wholesale',
        wholesaleFormData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setShowWholesaleForm(false);
        // Reload profile to show updated status
        loadUserProfile();
        // Force reload of userProfile in context
        window.location.reload();
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

  if (loading) {
    return (
      <div className='border-t pt-16 flex items-center justify-center min-h-[60vh]'>
        <p className='text-lg text-gray-500'>Loading profile...</p>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className='border-t pt-16 flex items-center justify-center min-h-[60vh]'>
        <p className='text-lg text-gray-500'>No user data found</p>
      </div>
    )
  }

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl mb-8'>
        <Title text1={'MY'} text2={'PROFILE'} />
      </div>

      <div className='max-w-2xl'>
        {/* Profile Information Card */}
        <div className='bg-gray-50 p-6 rounded border'>
          <div className='mb-6'>
            <h3 className='text-lg font-semibold text-gray-800 mb-4'>Account Information</h3>
            
            <div className='space-y-4'>
              <div className='border-b pb-3'>
                <label className='text-gray-600 text-sm font-medium'>Name</label>
                <p className='text-gray-800 text-base mt-1'>{userData.name}</p>
              </div>

              <div className='border-b pb-3'>
                <label className='text-gray-600 text-sm font-medium'>Email</label>
                <p className='text-gray-800 text-base mt-1'>{userData.email}</p>
              </div>

              <div>
                <label className='text-gray-600 text-sm font-medium'>Member Since</label>
                <p className='text-gray-800 text-base mt-1'>
                  {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Recently'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Wholesale Account Section */}
        {userData.role === 'retail' ? (
          <div className='bg-red-50 border-2 border-red-200 p-6 rounded-lg mt-6 shadow-md'>
            <h3 className='text-lg font-semibold text-red-900 mb-2'>Interested in Wholesale?</h3>
            <p className='text-sm text-gray-700 mb-4'>
              Apply for a wholesale account to access special pricing and bulk order discounts.
            </p>
            
            {!showWholesaleForm ? (
              <button
                onClick={() => setShowWholesaleForm(true)}
                className='bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 text-sm font-bold rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md transform hover:scale-105'
              >
                Apply for Wholesale Account
              </button>
            ) : (
              <form onSubmit={handleWholesaleSubmit} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Business Name *</label>
                  <input
                    type='text'
                    name='businessName'
                    value={wholesaleFormData.businessName}
                    onChange={handleWholesaleInputChange}
                    required
                    className='w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>GST Number *</label>
                  <input
                    type='text'
                    name='gstNumber'
                    value={wholesaleFormData.gstNumber}
                    onChange={handleWholesaleInputChange}
                    required
                    className='w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Business Phone *</label>
                  <input
                    type='tel'
                    name='businessPhone'
                    value={wholesaleFormData.businessPhone}
                    onChange={handleWholesaleInputChange}
                    required
                    className='w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Business Address *</label>
                  <textarea
                    name='businessAddress'
                    value={wholesaleFormData.businessAddress}
                    onChange={handleWholesaleInputChange}
                    required
                    rows='3'
                    className='w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  />
                </div>
                <div className='flex gap-3'>
                  <button
                    type='submit'
                    disabled={submitting}
                    className='bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 text-sm font-bold rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105'
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                  <button
                    type='button'
                    onClick={() => setShowWholesaleForm(false)}
                    className='bg-gray-300 text-gray-700 px-6 py-2 text-sm font-medium rounded hover:bg-gray-400 transition-colors'
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : userData.role === 'wholesale' && !userData.isApproved ? (
          <div className='bg-orange-50 border border-orange-200 p-6 rounded mt-6'>
            <h3 className='text-lg font-semibold text-orange-900 mb-2'>Wholesale Application Pending</h3>
            <p className='text-sm text-gray-700'>
              Your wholesale account application is under review. You'll be notified once approved.
            </p>
            <div className='mt-4 space-y-2 text-sm text-gray-600'>
              <p><strong>Business Name:</strong> {userData.businessName}</p>
              <p><strong>GST Number:</strong> {userData.gstNumber}</p>
            </div>
          </div>
        ) : userData.role === 'wholesale' && userData.isApproved ? (
          <div className='bg-green-50 border border-green-200 p-6 rounded mt-6'>
            <h3 className='text-lg font-semibold text-green-900 mb-2'>✓ Wholesale Account Active</h3>
            <p className='text-sm text-gray-700 mb-4'>
              Your wholesale account is active. You can now see wholesale pricing on eligible products.
            </p>
            <div className='space-y-2 text-sm text-gray-600'>
              <p><strong>Business Name:</strong> {userData.businessName}</p>
              <p><strong>GST Number:</strong> {userData.gstNumber}</p>
              <p><strong>Business Phone:</strong> {userData.businessPhone}</p>
            </div>
          </div>
        ) : null}

        {/* Quick Actions */}
        <div className='mt-8 flex gap-4'>
          <button 
            onClick={() => navigate('/orders')}
            className='bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 text-sm font-bold rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md transform hover:scale-105'
          >
            View Orders
          </button>
          <button 
            onClick={() => navigate('/collection')}
            className='border-2 border-red-600 text-red-600 px-8 py-3 text-sm font-semibold rounded-lg hover:bg-red-600 hover:text-white transition-all'
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile
