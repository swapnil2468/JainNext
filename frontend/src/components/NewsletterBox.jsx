const NewsletterBox = () => {
  const onSubmitHandler = (event) => {
    event.preventDefault();
  }

  return (
    <div className='py-20 px-6 lg:px-8'>
      <div className='bg-gradient-to-br from-rose-700 to-rose-600 rounded-3xl p-12 lg:p-16 relative overflow-hidden'>
        {/* Decorative blobs */}
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl'></div>
          <div className='absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl'></div>
        </div>

        <div className='relative text-center space-y-6 max-w-2xl mx-auto'>
          <h2 className='text-3xl lg:text-4xl font-light text-white'>
            Stay Connected with <span className='font-medium'>Jainnext</span>
          </h2>
          <p className='text-lg text-rose-100'>
            Subscribe to receive updates, exclusive deals, and special festival offers straight to your inbox
          </p>

          {/* Email Form */}
          <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2'>
            <input
              className='flex-1 px-6 py-4 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-rose-200 text-sm focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all duration-200'
              type='email'
              placeholder='Enter your email'
              required
            />
            <button
              type='submit'
              className='px-8 py-4 bg-white text-rose-700 text-sm font-medium rounded-full hover:bg-rose-50 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap'
            >
              Subscribe
            </button>
          </form>

          {/* Trust indicators */}
          <div className='flex flex-wrap justify-center gap-6 pt-2 text-sm text-rose-200'>
            <span className='flex items-center gap-2'>
              <i className='ri-shield-check-line'></i>
              No spam ever
            </span>
            <span className='flex items-center gap-2'>
              <i className='ri-mail-line'></i>
              Weekly updates
            </span>
            <span className='flex items-center gap-2'>
              <i className='ri-gift-line'></i>
              Exclusive deals
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsletterBox