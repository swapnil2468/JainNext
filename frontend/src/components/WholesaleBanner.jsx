import React from 'react'
import { useNavigate } from 'react-router-dom'

const WholesaleBanner = () => {
  const navigate = useNavigate();

  return (
    <div className='my-16 py-12 px-6 bg-gradient-to-br from-red-600 via-red-700 to-black rounded-xl text-white shadow-2xl relative overflow-hidden'>
      <div className='absolute inset-0 bg-black opacity-20'></div>
      <div className='max-w-4xl mx-auto text-center relative z-10'>
        <div className='inline-block bg-white text-red-600 px-4 py-1 rounded-full text-sm font-bold mb-4'>
          BUSINESS PRICING
        </div>
        <div className='text-5xl mb-4'>💼</div>
        <h2 className='text-3xl md:text-4xl font-bold mb-4'>
          Wholesale Pricing for Bulk Orders
        </h2>
        <p className='text-lg md:text-xl mb-6 opacity-90'>
          Get 20-40% off retail prices • Minimum order quantities • Dedicated support
        </p>
        <p className='text-base mb-8 opacity-80'>
          Perfect for retailers, event planners, decorators & corporate buyers
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <button 
            onClick={() => {
              navigate('/wholesale');
              window.scrollTo(0, 0);
            }}
            className='bg-white text-red-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all shadow-xl transform hover:scale-105'
          >
            Apply for Wholesale
          </button>
          <button 
            onClick={() => {
              navigate('/wholesale');
              window.scrollTo(0, 0);
            }}
            className='border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-all transform hover:scale-105'
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  )
}

export default WholesaleBanner
