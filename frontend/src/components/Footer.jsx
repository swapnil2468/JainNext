import React from 'react'
import { assets } from '../assets/assets'
import { FaFacebookF, FaInstagram, FaYoutube, FaTwitter } from "react-icons/fa"
import { useNavigate } from 'react-router-dom'

const Footer = () => {
  const navigate = useNavigate();
  return (
    <div className='bg-red-100 mt-40 -mx-4 sm:-mx-[5vw] md:-mx-[7vw] lg:-mx-[9vw]'>

      {/* MAIN FOOTER CONTENT */}
      <div className='px-6 sm:px-8 lg:px-16 py-8'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-3'>

          {/* ABOUT SECTION */}
          <div className='lg:col-span-1'>
            <img src={assets.logo} className='mb-5 w-32' alt="logo" />
            <p className='text-base text-gray-700 leading-7 mb-4 font-medium'>
              Premium lighting solutions for your space.
            </p>
            
            {/* SOCIAL MEDIA */}
            <div className='flex gap-4'>
              <a href="#" className='w-12 h-12 rounded-full bg-red-100 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all duration-300 text-gray-700'>
                <FaFacebookF size={20} />
              </a>
              <a href="#" className='w-12 h-12 rounded-full bg-red-100 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all duration-300 text-gray-700'>
                <FaInstagram size={20} />
              </a>
              <a href="#" className='w-12 h-12 rounded-full bg-red-100 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all duration-300 text-gray-700'>
                <FaYoutube size={20} />
              </a>
              <a href="#" className='w-12 h-12 rounded-full bg-red-100 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all duration-300 text-gray-700'>
                <FaTwitter size={20} />
              </a>
            </div>
          </div>

          {/* SHOPPING */}
          <div>
            <h3 className='text-lg font-bold text-gray-900 mb-6 pb-3 border-b-3 border-red-600 inline-block'>Shopping</h3>
            <ul className='flex flex-col gap-3 text-base text-gray-700'>
              <li onClick={() => navigate('/')} className='cursor-pointer hover:text-red-700 transition-colors duration-200 font-medium'>My Account</li>
              <li onClick={() => navigate('/orders')} className='cursor-pointer hover:text-red-700 transition-colors duration-200 font-medium'>Order Tracking</li>
              <li className='cursor-pointer hover:text-red-700 transition-colors duration-200 font-medium'>Store Locator</li>
              <li className='cursor-pointer hover:text-red-700 transition-colors duration-200 font-medium'>Offers</li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h3 className='text-lg font-bold text-gray-900 mb-6 pb-3 border-b-3 border-red-600 inline-block'>Company</h3>
            <ul className='flex flex-col gap-3 text-base text-gray-700'>
              <li onClick={() => navigate('/about')} className='cursor-pointer hover:text-red-700 transition-colors duration-200 font-medium'>About Us</li>
              <li className='cursor-pointer hover:text-red-700 transition-colors duration-200 font-medium'>Certificates</li>
              <li className='cursor-pointer hover:text-red-700 transition-colors duration-200 font-medium'>Our Team</li>
              <li className='cursor-pointer hover:text-red-700 transition-colors duration-200 font-medium'>Careers</li>
              <li className='cursor-pointer hover:text-red-700 transition-colors duration-200 font-medium'>FAQs</li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h3 className='text-lg font-bold text-gray-900 mb-6 pb-3 border-b-3 border-red-600 inline-block'>Support</h3>
            <ul className='flex flex-col gap-3 text-base text-gray-700'>
              <li className='cursor-pointer hover:text-red-700 transition-colors duration-200 font-medium'>Terms of Use</li>
              <li className='cursor-pointer hover:text-red-700 transition-colors duration-200 font-medium'>Privacy Policy</li>
              <li className='cursor-pointer hover:text-red-700 transition-colors duration-200 font-medium'>Shipping Info</li>
              <li className='cursor-pointer hover:text-red-700 transition-colors duration-200 font-medium'>Returns</li>
              <li className='cursor-pointer hover:text-red-700 transition-colors duration-200 font-medium'>Contact Us</li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className='text-lg font-bold text-gray-900 mb-6 pb-3 border-b-3 border-red-600 inline-block'>Contact</h3>
            <div className='text-base text-gray-700 space-y-2'>
              <div>
                <p className='text-xs text-red-600 uppercase tracking-widest font-bold mb-1'>Address</p>
                <p className='text-sm leading-6 font-medium'>1940/10, Second Floor<br/>Chandni Chowk, Delhi<br/>110006 IND</p>
              </div>
              <div>
                <p className='text-xs text-red-600 uppercase tracking-widest font-bold mb-1'>Phone</p>
                <p className='cursor-pointer hover:text-red-700 transition-colors duration-200 font-medium'>+91 9811915725</p>
              </div>
              <div>
                <p className='text-xs text-red-600 uppercase tracking-widest font-bold mb-1'>Email</p>
                <p className='cursor-pointer hover:text-red-700 transition-colors duration-200 font-medium text-sm break-all'>jaisatyaenterprises@gmail.com</p>
              </div>
            </div>
          </div>

        </div>

        {/* DIVIDER */}
        <hr className='border-red-200 my-3' />

        {/* COPYRIGHT */}
        <div className='text-center'>
          <p className='text-base text-gray-700 font-medium'>
            © 2026 <span className='font-bold text-gray-900'>Jai Satya Enterprises</span> - All Rights Reserved. | Crafted with ❤️
          </p>
        </div>
      </div>

    </div>
  )
}

export default Footer
