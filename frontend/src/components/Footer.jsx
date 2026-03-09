import React from 'react'
import { assets } from '../assets/assets'
import { FaFacebookF, FaInstagram, FaYoutube, FaTwitter } from "react-icons/fa"
import { useNavigate } from 'react-router-dom'

const Footer = () => {
  const navigate = useNavigate();
  return (
    <div>

      <div className='flex flex-col sm:grid grid-cols-[2fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        {/* LEFT SECTION */}
        <div>
          <img src={assets.logo} className='mb-5 w-32' alt="logo" />

          <p className='text-gray-600 leading-6'>
            <b>Jai Satya Enterprises</b><br/>
            1940/10 Second Floor, Mai H.C. Road,<br/>
            Near Gurudwara Sis Ganj Sahib,<br/>
            Chandni Chowk, Delhi - 110006
          </p>

          {/* SOCIAL MEDIA */}
          <div className='flex gap-4 mt-5 text-xl'>
            <FaFacebookF className='cursor-pointer' />
            <FaInstagram className='cursor-pointer' />
            <FaYoutube className='cursor-pointer' />
            <FaTwitter className='cursor-pointer' />
          </div>
        </div>

        {/* COMPANY */}
        <div>
          <p className='text-xl font-medium mb-5'>COMPANY</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li onClick={() => navigate('/')} className='cursor-pointer hover:text-black'>Home</li>
            <li onClick={() => navigate('/about')} className='cursor-pointer hover:text-black'>About Us</li>
            <li onClick={() => navigate('/wholesale')} className='cursor-pointer hover:text-red-600 font-semibold'>Wholesale</li>
            <li className='cursor-pointer hover:text-black'>Delivery</li>
            <li className='cursor-pointer hover:text-black'>Privacy Policy</li>
          </ul>
        </div>

        {/* GET IN TOUCH */}
        <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>+91-9811915725</li>
            <li>jaisatyaenterprises@gmail.com</li>
          </ul>
        </div>

      </div>

      {/* COPYRIGHT */}
      <div>
        <hr />
        <p className='py-5 text-sm text-center'>
          © 2026 Jai Satya Enterprises - All Rights Reserved.
        </p>
      </div>

    </div>
  )
}

export default Footer
