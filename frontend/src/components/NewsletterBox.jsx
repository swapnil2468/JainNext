import React from 'react'

const NewsletterBox = () => {

    const onSubmitHandler = (event) => {
        event.preventDefault();
    }

  return (
    <div className=' text-center'>
      <p className='text-2xl font-bold text-gray-900'>Subscribe now & get 5% off</p>
      <p className='text-gray-600 mt-3'>
      Get exclusive deals, early access to new lighting collections, and special festival offers straight to your inbox. 
      </p>
      <form onSubmit={onSubmitHandler} className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border-2 border-gray-300 pl-3 rounded-lg overflow-hidden shadow-md'>
        <input className='w-full sm:flex-1 outline-none px-2' type="email" placeholder='Enter your email' required/>
        <button type='submit' className='bg-gradient-to-r from-red-600 to-red-700 text-white text-xs px-10 py-4 font-bold hover:from-red-700 hover:to-red-800 transition-all'>SUBSCRIBE</button>
      </form>
    </div>
  )
}

export default NewsletterBox
