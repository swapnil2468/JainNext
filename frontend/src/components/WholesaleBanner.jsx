import React from 'react'
import { useNavigate } from 'react-router-dom'

const WholesaleBanner = () => {
  const navigate = useNavigate();

  return (
    <section id="wholesale-preview" className="py-20 px-6 lg:px-8 bg-gradient-to-br from-rose-50 via-white to-orange-50/30">
      <div className="w-full px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 text-sm font-medium rounded-full">
              <i className="ri-store-2-line"></i>
              <span>Business Solutions</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-light text-neutral-900 leading-tight">
              Wholesale Pricing for
              <span className="block font-medium mt-2">Bulk Orders</span>
            </h2>

            <p className="text-lg text-neutral-600 leading-relaxed">
              Partner with us for exclusive wholesale rates on premium lighting fixtures. Perfect for interior designers, contractors, retailers, and hospitality projects.
            </p>
            {/* Benefits List */}
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 flex items-center justify-center bg-rose-100 rounded-full flex-shrink-0 mt-0.5">
                  <i className="ri-check-line text-rose-700 text-sm"></i>
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Competitive Bulk Pricing</p>
                  <p className="text-sm text-neutral-600">Save up to 40% on large orders</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 flex items-center justify-center bg-rose-100 rounded-full flex-shrink-0 mt-0.5">
                  <i className="ri-check-line text-rose-700 text-sm"></i>
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Dedicated Account Manager</p>
                  <p className="text-sm text-neutral-600">Personalized support for your projects</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 flex items-center justify-center bg-rose-100 rounded-full flex-shrink-0 mt-0.5">
                  <i className="ri-check-line text-rose-700 text-sm"></i>
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Fast Turnaround</p>
                  <p className="text-sm text-neutral-600">Priority processing and shipping</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 flex items-center justify-center bg-rose-100 rounded-full flex-shrink-0 mt-0.5">
                  <i className="ri-check-line text-rose-700 text-sm"></i>
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Custom Solutions</p>
                  <p className="text-sm text-neutral-600">Tailored lighting packages for your needs</p>
                </div>
              </div>
            </div>
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-6">
              <button
                onClick={() => {
                  navigate('/wholesale');
                  window.scrollTo(0, 0);
                }}
                className="group relative px-8 py-4 bg-gradient-to-r from-rose-700 to-rose-600 text-white text-sm font-medium rounded-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-rose-600/30 hover:-translate-y-0.5 whitespace-nowrap"
              >
                <span className="relative z-10">Apply for Wholesale</span>
                <div className="absolute inset-0 bg-gradient-to-r from-rose-800 to-rose-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button
                onClick={() => {
                  navigate('/wholesale');
                  window.scrollTo(0, 0);
                }}
                className="px-8 py-4 bg-white text-neutral-900 text-sm font-medium rounded-full border border-rose-200 hover:border-rose-300 hover:bg-rose-50/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
              >
                Learn More
              </button>
            </div>
          </div>
          {/* Right Image Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-white p-6 border border-neutral-200/60 shadow-lg">
                <div className="aspect-square bg-gradient-to-br from-neutral-50 to-rose-50/30 rounded-xl overflow-hidden">
                  <img
                    src="https://readdy.ai/api/search-image?query=luxury commercial lighting fixtures displayed in elegant showroom with multiple pendant lights and chandeliers professional wholesale display clean white background&width=400&height=400&seq=wholesale-1&orientation=squarish"
                    alt="Wholesale Lighting Display"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm font-medium text-neutral-900">Bulk Orders</p>
                  <p className="text-xs text-neutral-500">Starting at 50 units</p>
                </div>
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="relative rounded-2xl overflow-hidden bg-white p-6 border border-neutral-200/60 shadow-lg">
                <div className="aspect-square bg-gradient-to-br from-neutral-50 to-rose-50/30 rounded-xl overflow-hidden">
                  <img
                    src="https://readdy.ai/api/search-image?query=professional interior designer reviewing lighting catalog samples in modern office with various light fixtures business meeting wholesale partnership&width=400&height=400&seq=wholesale-2&orientation=squarish"
                    alt="Wholesale Partnership"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm font-medium text-neutral-900">Trade Partners</p>
                  <p className="text-xs text-neutral-500">Exclusive benefits</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Stats Bar */}
        <div className="grid md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-neutral-200">
          <div className="text-center">
            <p className="text-3xl font-light text-rose-700 mb-2">500+</p>
            <p className="text-sm text-neutral-600">Business Partners</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-light text-rose-700 mb-2">10K+</p>
            <p className="text-sm text-neutral-600">Units Shipped Monthly</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-light text-rose-700 mb-2">40%</p>
            <p className="text-sm text-neutral-600">Average Savings</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-light text-rose-700 mb-2">24/7</p>
            <p className="text-sm text-neutral-600">Support Available</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WholesaleBanner
