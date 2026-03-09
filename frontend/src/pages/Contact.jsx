import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const Contact = () => {
  return (
    <div>
      
      <div className='text-center text-2xl pt-10 border-t'>
          <Title text1={'CONTACT'} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28'>
        <img className='w-full md:max-w-[480px]' src={assets.contact_img} alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-xl text-gray-600'>Our Store</p>
          <p className=' text-gray-500'>1940/10 Second floor, Mai H.C. Road <br /> Near Gurudwara Sis Ganj Sahib,<br />Opposite OMAXE Mall,<br /> Chandni Chowk, Delhi-110006</p> 
          <p className=' text-gray-500'>Tel: +91-9811915725 <br /> Email: admin@forever.com</p>
          <button className='border-2 border-red-600 text-red-600 px-8 py-4 text-sm font-semibold hover:bg-red-600 hover:text-white transition-all duration-300 rounded-lg shadow-md hover:shadow-lg'>Get in touch</button>
        </div>
      </div>

      <NewsletterBox/>
    </div>
  )
}

export default Contact
