import React from 'react'
import { assets } from '../assets/assets'

const OurPolicy = () => {
  return (
    <div className='bg-white py-20'>
      <div className='px-4 sm:px-6 md:px-8'>
        <div className='flex flex-col sm:flex-row justify-around gap-8 text-center text-xs sm:text-sm md:text-base text-gray-700'>
          
          <div className='bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-600'>
            <img src={assets.exchange_icon} className='w-12 m-auto mb-5' alt="" />
            <p className='font-semibold text-gray-900'>Easy Exchange Policy</p>
            <p className='text-gray-500 mt-2'>We offer hassle free exchange policy</p>
          </div>

          <div className='bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-600'>
            <img src={assets.quality_icon} className='w-12 m-auto mb-5' alt="" />
            <p className='font-semibold text-gray-900'>7 Days Return Policy</p>
            <p className='text-gray-500 mt-2'>We provide 7 days free return policy</p>
          </div>

          <div className='bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-600'>
            <img src={assets.support_img} className='w-12 m-auto mb-5' alt="" />
            <p className='font-semibold text-gray-900'>Best customer support</p>
            <p className='text-gray-500 mt-2'>We provide 24/7 customer support</p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default OurPolicy
