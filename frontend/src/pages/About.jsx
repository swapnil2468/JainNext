import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  return (
    <div className='pt-20'>

      <div className='text-2xl text-center pt-8 border-t'>
          <Title text1={'ABOUT'} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
          <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
          <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
              
              <p><b>Welcome to Jainnext Decoration Lighting</b>, your one-stop destination for high-quality lighting solutions! Based in Delhi, we are a trusted Wholesaler, Distributor, and B2C supplier of a wide range of lighting products, including Decorative Lights, LED Flood Lights, LED Lights, LED Rope Lights, LED Strip Drivers, and much more.</p>
              <b className='text-gray-800'>Who We Are</b>
              <p>At Jainnext Deal, we specialize in providing premium lighting solutions that enhance homes, offices, commercial spaces, and outdoor areas. With years of experience in the lighting industry, we take pride in offering durable, energy-efficient, and aesthetically pleasing lighting products to our customers across India.</p>
              <b className='text-gray-800'>Our Mission</b>
              <p>Our mission is to illuminate your spaces with innovation and quality. Whether you are looking for stylish decorative lighting for your home or high-performance LED floodlights for commercial use, we bring you the best at competitive prices.</p>
          </div>
      </div>

      <div className=' text-xl py-4'>
          <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>

    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-sm'>

      <div className='group border-2 border-gray-200 rounded-xl p-6 flex flex-col gap-3
                      hover:border-red-500 hover:bg-red-50 hover:shadow-xl
                      transition duration-300 cursor-pointer'>
        <b className='text-base group-hover:text-red-600'>Extensive Product Range</b>
        <p className='text-gray-600 group-hover:text-gray-800'>
          From elegant decorative lights to powerful LED solutions, we have it all.
        </p>
      </div>

      <div className='group border-2 border-gray-200 rounded-xl p-6 flex flex-col gap-3
                      hover:border-red-500 hover:bg-red-50 hover:shadow-xl
                      transition duration-300 cursor-pointer'>
        <b className='text-base group-hover:text-red-600'>Quality & Reliability</b>
        <p className='text-gray-600 group-hover:text-gray-800'>
          We source and deliver only the best, ensuring long-lasting performance.
        </p>
      </div>

      <div className='group border-2 border-gray-200 rounded-xl p-6 flex flex-col gap-3
                      hover:border-red-500 hover:bg-red-50 hover:shadow-xl
                      transition duration-300 cursor-pointer'>
        <b className='text-base group-hover:text-red-600'>Wholesaler & Retailer</b>
        <p className='text-gray-600 group-hover:text-gray-800'>
          We cater to bulk orders for businesses as well as individual customers.
        </p>
      </div>

    </div>
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-sm'>

      <div className='group border-2 border-gray-200 rounded-xl p-6 flex flex-col gap-3
                      hover:border-red-500 hover:bg-red-50 hover:shadow-xl
                      transition duration-300 cursor-pointer'>
        <b className='text-base group-hover:text-red-600'>Competitive Pricing</b>
        <p className='text-gray-600 group-hover:text-gray-800'>
          Get high-quality lighting solutions at the affordable rates.
        </p>
      </div>

      <div className='group border-2 border-gray-200 rounded-xl p-6 flex flex-col gap-3
                      hover:border-red-500 hover:bg-red-50 hover:shadow-xl
                      transition duration-300 cursor-pointer'>
        <b className='text-base group-hover:text-red-600'>Fast & Secure Delivery</b>
        <p className='text-gray-600 group-hover:text-gray-800'>
          We source and deliver only the best, ensuring long-lasting performance.
        </p>
      </div>

      <div className='group border-2 border-gray-200 rounded-xl p-6 flex flex-col gap-3
                      hover:border-red-500 hover:bg-red-50 hover:shadow-xl
                      transition duration-300 cursor-pointer'>
        <b className='text-base group-hover:text-red-600'>Secure Payment Options</b>
        <p className='text-gray-600 group-hover:text-gray-800'>
          Transactions are processed safely through Razorpay.
        </p>
      </div>

    </div>

      <NewsletterBox/>
      
    </div>
  )
}

export default About
