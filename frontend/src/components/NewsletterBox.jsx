import React from 'react'

const NewsletterBox = () => {

    const onSubmitHandler = (event) => {
        event.preventDefault();
    }

  return (
    <div className='bg-white py-16 px-4 sm:px-6 md:px-8'>
      <div className='max-w-2xl mx-auto'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='w-12 h-1 bg-red-600'></div>
        </div>
        <p className='text-2xl sm:text-3xl font-bold text-gray-900'>Subscribe now & get 5% off</p>
        <p className='text-gray-600 mt-3 text-sm sm:text-base'>
        Get exclusive deals, early access to new lighting collections, and special festival offers straight to your inbox. 
        </p>
        <form onSubmit={onSubmitHandler} className='w-full sm:w-3/4 flex flex-col sm:flex-row items-center gap-0 mx-auto my-8 bg-gray-50 rounded-lg overflow-hidden shadow-md border border-gray-200'>
          <input className='w-full sm:flex-1 outline-none px-4 py-3 text-sm bg-gray-50' type="email" placeholder='Enter your email' required/>
          <button type='submit' className='bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm px-8 sm:px-10 py-3 font-bold transition-all whitespace-nowrap'>SUBSCRIBE</button>
        </form>
      </div>
    </div>
  )
}

export default NewsletterBox
