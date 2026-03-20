import React from 'react'

const WhyChooseUs = () => {
  const features = [
    {
      icon: 'ri-star-line',
      title: 'Premium Quality',
      description: 'Every piece is crafted with exceptional attention to detail using only the finest materials and components.',
    },
    {
      icon: 'ri-lightbulb-line',
      title: 'Expert Design',
      description: 'Our lighting solutions are designed by award-winning designers who understand the perfect balance of form and function.',
    },
    {
      icon: 'ri-shield-check-line',
      title: 'Lifetime Warranty',
      description: 'We stand behind our products with comprehensive warranty coverage and dedicated customer support.',
    },
    {
      icon: 'ri-truck-line',
      title: 'Fast Delivery',
      description: 'Free express shipping on all orders over $200 with careful packaging to ensure your items arrive perfectly.',
    },
    {
      icon: 'ri-customer-service-2-line',
      title: 'Expert Support',
      description: 'Our lighting specialists are available to help you choose the perfect fixtures for your unique space.',
    },
    {
      icon: 'ri-leaf-line',
      title: 'Eco-Friendly',
      description: 'Sustainable materials and energy-efficient LED technology for responsible luxury lighting solutions.',
    },
  ];

  return (
    <section className="py-20 px-6 lg:px-8 bg-white">
      <div className="w-full px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-4xl lg:text-5xl font-light text-neutral-900">
            Why Choose Us
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Experience the difference that premium quality and exceptional service make
          </p>
        </div>
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-neutral-50 to-white rounded-2xl p-8 border border-neutral-200/60 transition-all duration-300 hover:shadow-xl hover:shadow-rose-900/8 hover:-translate-y-1 hover:border-rose-200"
            >
              {/* Icon Container */}
              <div className="mb-6 w-14 h-14 flex items-center justify-center bg-gradient-to-br from-rose-100 to-rose-50 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-rose-200/50">
                <i className={`${feature.icon} text-2xl text-rose-700`}></i>
              </div>
              {/* Content */}
              <h3 className="text-xl font-medium text-neutral-900 mb-3 group-hover:text-rose-700 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                {feature.description}
              </p>
              {/* Subtle hover accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-rose-100/0 to-rose-100/20 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs
