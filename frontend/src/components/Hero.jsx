import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Hero = () => {
  const navigate = useNavigate()

  return (
    <section className='w-full pt-24 pb-16 px-6 lg:px-8 relative overflow-hidden'>
      {/* Subtle gradient background with warm reddish tones */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50/60 via-rose-50/20 to-orange-50/30 pointer-events-none"></div>

      {/* Soft glow effect with warm tones */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-200/15 rounded-full blur-3xl"></div>
      
      <div className="relative w-full px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-medium tracking-wider text-rose-700 uppercase">
                Premium Lighting Collection
              </p>
              <h1 className="text-5xl lg:text-6xl font-light text-neutral-900 leading-tight">
                Illuminate Your
                <span className="block font-medium mt-2">Perfect Space</span>
              </h1>
              <p className="text-lg text-neutral-600 leading-relaxed max-w-lg">
                Discover handcrafted lighting designed to transform any room into an elegant sanctuary. Where artistry meets illumination.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/collection')}
                className="group relative px-8 py-4 bg-gradient-to-r from-rose-700 to-rose-600 text-white text-sm font-medium rounded-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-rose-600/30 hover:-translate-y-0.5 whitespace-nowrap"
              >
                <span className="relative z-10">Explore Collection</span>
                <div className="absolute inset-0 bg-gradient-to-r from-rose-800 to-rose-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <a
                href="#learn"
                className="px-8 py-4 bg-white text-neutral-900 text-sm font-medium rounded-full border border-rose-200 hover:border-rose-300 hover:bg-rose-50/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
              >
                Learn More
              </a>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-8 pt-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 flex items-center justify-center bg-rose-50 rounded-full">
                  <i className="ri-truck-line text-rose-700"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">Free Shipping</p>
                  <p className="text-xs text-neutral-500">On orders over $200</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 flex items-center justify-center bg-rose-50 rounded-full">
                  <i className="ri-shield-check-line text-rose-700"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">Quality Assured</p>
                  <p className="text-xs text-neutral-500">Premium materials</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 flex items-center justify-center bg-rose-50 rounded-full">
                  <i className="ri-loop-left-line text-rose-700"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">Easy Returns</p>
                  <p className="text-xs text-neutral-500">30-day guarantee</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Image - Elevated Card */}
          <div className="relative">
            {/* Floating glow effect with warm tones */}
            <div className="absolute -inset-4 bg-gradient-to-br from-rose-200/30 to-orange-200/20 rounded-3xl blur-2xl"></div>

            {/* Product Card */}
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl shadow-rose-900/10 transition-all duration-500 hover:shadow-3xl hover:shadow-rose-900/15 hover:-translate-y-2">
              <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-50 to-rose-50/30">
                <img
                  src={assets.lamp}
                  alt="Featured Premium Pendant Light"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>

              {/* Bestseller Badge */}
              <div className="absolute top-12 right-12 bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg">
                Bestseller
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
