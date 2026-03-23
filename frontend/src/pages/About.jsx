import React from 'react'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  return (
    <div className='min-h-screen'>

      {/* Hero */}
      <div className='relative pt-24 pb-24 px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-rose-50/40 via-white to-orange-50/30 min-h-screen flex items-center justify-center'>
        <div className='absolute top-0 left-1/4 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl pointer-events-none'></div>
        <div className='absolute bottom-0 right-1/4 w-96 h-96 bg-orange-200/15 rounded-full blur-3xl pointer-events-none'></div>
        <div className='relative max-w-5xl mx-auto text-center'>
          <span className='inline-block bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-rose-200'>
            Since 2019
          </span>
          <h1 className='text-5xl md:text-7xl font-light text-neutral-900 mb-8 leading-tight'>
            Illuminating <span className='font-bold text-rose-600'>India's Spaces</span> With Premium Lighting
          </h1>
          <p className='text-xl md:text-2xl text-neutral-700 mb-6 font-light leading-relaxed max-w-3xl mx-auto'>
            From individual homes to large-scale commercial projects, Jainnext brings innovation, quality, and expertise to every lighting solution across India.
          </p>
          <p className='text-lg text-neutral-600 max-w-2xl mx-auto mb-16'>
            We believe great lighting transforms spaces into experiences. Whether it's decorative elegance or powerful LED solutions, we've got you covered.
          </p>
          
          {/* Impact Stats */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 border-t border-neutral-200'>
            <div className='text-center'>
              <p className='text-4xl md:text-5xl font-light text-rose-600 mb-2'>10K+</p>
              <p className='text-sm md:text-base text-neutral-600 font-medium'>Happy Customers</p>
              <p className='text-xs text-neutral-500 mt-1'>Across India</p>
            </div>
            <div className='text-center'>
              <p className='text-4xl md:text-5xl font-light text-rose-600 mb-2'>500+</p>
              <p className='text-sm md:text-base text-neutral-600 font-medium'>Products</p>
              <p className='text-xs text-neutral-500 mt-1'>Ever Expanding</p>
            </div>
            <div className='text-center'>
              <p className='text-4xl md:text-5xl font-light text-rose-600 mb-2'>5+</p>
              <p className='text-sm md:text-base text-neutral-600 font-medium'>Years</p>
              <p className='text-xs text-neutral-500 mt-1'>Industry Experience</p>
            </div>
            <div className='text-center'>
              <p className='text-4xl md:text-5xl font-light text-rose-600 mb-2'>Pan India</p>
              <p className='text-sm md:text-base text-neutral-600 font-medium'>Delivery</p>
              <p className='text-xs text-neutral-500 mt-1'>Anywhere, Anytime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Who We Are */}
      <div className='py-20 px-6 lg:px-8'>
        <div className='flex flex-col lg:flex-row gap-16 items-center'>
          <div className='w-full lg:w-1/2'>
            <img
              className='w-full rounded-3xl shadow-xl object-cover'
              src={assets.about_img}
              alt='About Jainnext'
            />
          </div>
          <div className='w-full lg:w-1/2 space-y-5'>
            <div>
              <h2 className='text-4xl font-light text-neutral-900 mb-3'>
                Who We <span className='font-medium text-rose-600'>Are</span>
              </h2>
              <div className='w-16 h-0.5 bg-rose-600'></div>
            </div>
            <p className='text-neutral-600 leading-relaxed'>
              <strong className='text-neutral-900'>Welcome to Jainnext Decoration Lighting</strong> — your one-stop destination for high-quality lighting solutions. Based in Delhi, we are a trusted Wholesaler, Distributor, and B2C supplier of decorative lights, LED fixtures, rope lights, flood lights, and much more.
            </p>
            <p className='text-neutral-600 leading-relaxed'>
              We understand that lighting is more than illumination — it is about creating the right ambiance. Our team works closely with customers, retailers, and contractors to provide personalized recommendations and expert guidance for every project.
            </p>
            <p className='text-neutral-600 leading-relaxed'>
              Our mission is to illuminate your spaces with innovation and quality while building lasting relationships — from individual homeowners to large-scale commercial clients across India.
            </p>
            <div className='flex flex-wrap gap-3 pt-2'>
              {[
                { icon: 'ri-map-pin-line', label: 'Based in Delhi' },
                { icon: 'ri-store-2-line', label: 'B2B and B2C' },
                { icon: 'ri-india-line', label: 'Pan India Delivery' }
              ].map((tag, i) => (
                <div key={i} className='flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full border border-rose-100'>
                  <i className={`${tag.icon} text-rose-600 text-sm`}></i>
                  <span className='text-sm font-medium text-neutral-700'>{tag.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className='py-20 px-6 lg:px-8 bg-gradient-to-b from-neutral-50 to-white'>
        <div className='text-center mb-12'>
          <h2 className='text-4xl font-light text-neutral-900'>
            Why Choose <span className='font-medium text-rose-600'>Us</span>
          </h2>
          <div className='w-16 h-0.5 bg-rose-600 mx-auto mt-3'></div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {[
            { icon: 'ri-stack-line', title: 'Extensive Product Range', desc: 'From elegant decorative lights to powerful LED solutions, we have it all.' },
            { icon: 'ri-shield-check-line', title: 'Quality and Reliability', desc: 'We source and deliver only the best, ensuring long-lasting performance.' },
            { icon: 'ri-store-2-line', title: 'Wholesaler and Retailer', desc: 'We cater to bulk orders for businesses as well as individual customers.' },
            { icon: 'ri-price-tag-3-line', title: 'Competitive Pricing', desc: 'Get high-quality lighting solutions at the most affordable rates.' },
            { icon: 'ri-truck-line', title: 'Fast and Secure Delivery', desc: 'Quick dispatch with reliable shipping partners across India.' },
            { icon: 'ri-secure-payment-line', title: 'Secure Payments', desc: 'Transactions processed safely through Razorpay payment gateway.' }
          ].map((item, i) => (
            <div key={i} className='group bg-white rounded-2xl p-6 border border-neutral-200/60 hover:shadow-xl hover:shadow-rose-900/10 hover:-translate-y-1 hover:border-rose-200 transition-all duration-300'>
              <div className='w-12 h-12 bg-gradient-to-br from-rose-100 to-rose-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300'>
                <i className={`${item.icon} text-rose-600 text-xl`}></i>
              </div>
              <h3 className='font-medium text-neutral-900 mb-2 group-hover:text-rose-600 transition-colors'>{item.title}</h3>
              <p className='text-neutral-600 text-sm leading-relaxed'>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div className='mx-6 lg:mx-8 mb-20 bg-gradient-to-br from-rose-700 to-rose-600 rounded-3xl p-12 text-center relative overflow-hidden'>
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl'></div>
          <div className='absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl'></div>
        </div>
        <div className='relative'>
          <h2 className='text-3xl font-light text-white mb-3'>
            Ready to <span className='font-medium'>Light Up Your Space?</span>
          </h2>
          <p className='text-rose-100 mb-8'>Explore our full collection of premium lighting products</p>
          <a
            href='/collection'
            className='inline-block px-8 py-4 bg-white text-rose-700 text-sm font-medium rounded-full hover:bg-rose-50 transition-all hover:shadow-xl hover:-translate-y-0.5'
          >
            Browse Collection
          </a>
        </div>
      </div>

      

    </div>
  )
}

export default About
