import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className='w-full min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 flex items-center justify-center px-4'>
      <div className='text-center'>
        {/* 404 Text */}
        <h1 className='text-6xl md:text-8xl font-bold text-gray-900 mb-4'>404</h1>
        
        {/* Heading */}
        <h2 className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
          Page Not Found
        </h2>
        
        {/* Description */}
        <p className='text-lg text-gray-600 mb-8 max-w-md mx-auto'>
          Sorry, the page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        
        {/* Back to Home Button */}
        <Link 
          to='/' 
          className='inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition duration-300 font-semibold'
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
