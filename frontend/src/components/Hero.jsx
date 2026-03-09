import React from 'react'
import { assets } from '../assets/assets'

const Hero = () => {
  return (
    <div className='flex flex-col sm:flex-row border-2 border-gray-300 shadow-lg rounded-lg overflow-hidden'>
      {/* Hero Left Side */}
      <div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0 bg-gradient-to-br from-white to-gray-50'>
            <div className='text-gray-900'>
                <div className='flex items-center gap-2'>
                    <p className='w-8 md:w-11 h-[2px] bg-red-600'></p>
                    <p className='font-bold text-sm md:text-base text-red-600'>OUR BESTSELLERS</p>
                </div>
                <h1 className='prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed font-bold'>Latest Arrivals</h1>
                <div className='flex items-center gap-2 cursor-pointer group'>
                    <p className='font-semibold text-sm md:text-base group-hover:text-red-600 transition-colors'>SHOP NOW</p>
                    <p className='w-8 md:w-11 h-[2px] bg-gray-900 group-hover:bg-red-600 transition-colors'></p>
                </div>
            </div>
      </div>
      {/* Hero Right Side */}
      <img className='w-full sm:w-1/2' src={assets.hero_img} alt="" />
    </div>
  )
}

export default Hero
