import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div className='min-h-screen'>

      {/* Hero Section */}
      {/* <div className='relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-rose-50/40 via-white to-orange-50/30'>
        <div className='absolute top-0 left-1/4 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl pointer-events-none'></div>
        <div className='absolute bottom-0 right-1/4 w-96 h-96 bg-orange-200/15 rounded-full blur-3xl pointer-events-none'></div>
        <div className='relative max-w-4xl mx-auto text-center'>
          <span className='inline-block bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-rose-200'>
            Our Story
          </span>
          <h1 className='text-4xl md:text-6xl font-light text-neutral-900 mb-6'>
            About <span className='font-medium text-rose-600'>Jainnext</span>
          </h1>
          <p className='text-lg text-neutral-600 max-w-2xl mx-auto'>
            Your trusted destination for premium lighting solutions across India
          </p>
        </div>
      </div> */}

      {/* Who We Are Section */}
      <div className='py-20 mt-20 px-6 lg:px-8'>
        <div className='flex flex-col lg:flex-row gap-16 items-center'>
          <div className='w-full lg:w-1/2'>
            <img
              className='w-full rounded-3xl shadow-xl object-cover'
              src={assets.about_img}
              alt='About Jainnext'
            />
          </div>
          <div className='w-full lg:w-1/2 space-y-6'>
            <div>
              <h2 className='text-4xl font-light text-neutral-900 mb-3'>
                Who We <span className='font-medium text-rose-600'>Are</span>
              </h2>
              <div className='w-16 h-0.5 bg-rose-600'></div>
            </div>
            <p className='text-neutral-600 leading-relaxed'>
              <strong className='text-neutral-900'>Welcome to Jainnext Decoration Lighting</strong> — your one-stop destination for high-quality lighting solutions! Based in Delhi, we are a trusted Wholesaler, Distributor, and B2C supplier of a wide range of lighting products. Since our inception, we have been committed to transforming spaces through innovative and premium lighting solutions that combine functionality with aesthetic appeal.
            </p>
            <p className='text-neutral-600 leading-relaxed'>
              At Jainnext, we specialize in providing premium lighting solutions that enhance homes, offices, commercial spaces, and outdoor areas. With years of experience in the lighting industry, we take pride in offering durable, energy-efficient, and aesthetically pleasing lighting products to our customers across India. Our extensive catalog includes decorative lights, LED fixtures, smart lighting systems, outdoor illumination, and customized solutions tailored to your specific needs.
            </p>
            <p className='text-neutral-600 leading-relaxed'>
              We understand that lighting is more than just illumination — it's about creating the right ambiance, improving energy efficiency, and enhancing the overall aesthetics of your space. Our team works closely with customers, retailers, and contractors to provide personalized recommendations and expert guidance in selecting the perfect lighting solutions.
            </p>
            <p className='text-neutral-600 leading-relaxed'>
              Quality assurance is at the heart of everything we do. We source products from trusted manufacturers and conduct rigorous quality checks to ensure every item meets our high standards. From residential projects to large-scale commercial installations, we deliver products that stand the test of time.
            </p>
            <p className='text-neutral-600 leading-relaxed'>
              Our mission is to illuminate your spaces with innovation and quality while building lasting relationships with our customers. Whether you are an individual homeowner, a retailer, a contractor, or a business looking for bulk lighting solutions, we bring you the best products at competitive prices with exceptional customer service.
            </p>
            <div className='flex flex-wrap gap-4 pt-4'>
              <div className='flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full border border-rose-100'>
                <i className='ri-map-pin-line text-rose-600'></i>
                <span className='text-sm font-medium text-neutral-700'>Based in Delhi</span>
              </div>
              <div className='flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full border border-rose-100'>
                <i className='ri-store-2-line text-rose-600'></i>
                <span className='text-sm font-medium text-neutral-700'>B2B & B2C</span>
              </div>
              <div className='flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full border border-rose-100'>
                <i className='ri-india-line text-rose-600'></i>
                <span className='text-sm font-medium text-neutral-700'>Pan India Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className='py-16 px-6 lg:px-8 bg-gradient-to-br from-rose-700 to-rose-600 relative overflow-hidden'>
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl'></div>
          <div className='absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl'></div>
        </div>
        <div className='relative grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white'>
          <div>
            <p className='text-4xl font-light mb-2'>500+</p>
            <p className='text-rose-200 text-sm'>Products Available</p>
          </div>
          <div>
            <p className='text-4xl font-light mb-2'>10K+</p>
            <p className='text-rose-200 text-sm'>Happy Customers</p>
          </div>
          <div>
            <p className='text-4xl font-light mb-2'>5+</p>
            <p className='text-rose-200 text-sm'>Years Experience</p>
          </div>
          <div>
            <p className='text-4xl font-light mb-2'>Pan</p>
            <p className='text-rose-200 text-sm'>India Delivery</p>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className='py-20 px-6 lg:px-8 bg-gradient-to-b from-white to-neutral-50'>
        <div className='text-center mb-12'>
          <h2 className='text-4xl font-light text-neutral-900'>
            Why Choose <span className='font-medium text-rose-600'>Us</span>
          </h2>
          <div className='w-16 h-0.5 bg-rose-600 mx-auto mt-3'></div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {[
            { icon: 'ri-stack-line', title: 'Extensive Product Range', desc: 'From elegant decorative lights to powerful LED solutions, we have it all.' },
            { icon: 'ri-shield-check-line', title: 'Quality & Reliability', desc: 'We source and deliver only the best, ensuring long-lasting performance.' },
            { icon: 'ri-store-2-line', title: 'Wholesaler & Retailer', desc: 'We cater to bulk orders for businesses as well as individual customers.' },
            { icon: 'ri-price-tag-3-line', title: 'Competitive Pricing', desc: 'Get high-quality lighting solutions at the most affordable rates.' },
            { icon: 'ri-truck-line', title: 'Fast & Secure Delivery', desc: 'Quick dispatch with reliable shipping partners across India.' },
            { icon: 'ri-secure-payment-line', title: 'Secure Payments', desc: 'Transactions are processed safely through Razorpay payment gateway.' }
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
    </div>
  )
}

export default About
