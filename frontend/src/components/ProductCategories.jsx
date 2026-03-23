import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'

const ProductCategories = () => {
  const { products } = useContext(ShopContext)
  const navigate = useNavigate()

  const categories = [
    {
      name: 'String Lights',
      image: 'https://readdy.ai/api/search-image?query=collection of elegant modern pendant lights hanging in sophisticated minimalist interior with soft warm lighting and clean white walls luxury home decor photography&width=800&height=600&seq=category-1&orientation=landscape',
    },
    {
      name: 'Waterfalls Lights',
      image: 'https://readdy.ai/api/search-image?query=stunning crystal and brass chandeliers displayed in elegant showroom with refined white interior and soft ambient lighting high end luxury lighting display&width=800&height=600&seq=category-2&orientation=landscape',
    },
    {
      name: 'SMD Lights',
      image: 'https://readdy.ai/api/search-image?query=modern designer floor lamps arranged in minimalist contemporary living space with neutral tones and clean aesthetic premium interior design photography&width=800&height=600&seq=category-3&orientation=landscape',
    },
    {
      name: 'Strip Lights',
      image: 'https://readdy.ai/api/search-image?query=beautiful wall sconce lights mounted on textured white wall in sophisticated hallway setting with warm glow and elegant shadows luxury home lighting&width=800&height=600&seq=category-4&orientation=landscape',
    },
    {
      name: 'Par & DJ Lights',
      image: 'https://readdy.ai/api/search-image?query=premium table lamps with fabric shades displayed on marble surface in refined minimalist setting with soft natural light elegant home decor styling&width=800&height=600&seq=category-5&orientation=landscape',
    },
    {
      name: 'Flood & Outdoor Lights',
      image: 'https://readdy.ai/api/search-image?query=stylish outdoor lighting fixtures illuminating modern architectural exterior with clean lines and warm evening glow contemporary landscape lighting design&width=800&height=600&seq=category-6&orientation=landscape',
    },
    {
      name: 'Decorative Lighting',
      image: 'https://readdy.ai/api/search-image?query=beautiful decorative lighting arrangements in modern interior space with warm ambient glow and elegant styling luxury home lighting design&width=800&height=600&seq=category-7&orientation=landscape',
    },
    // {
    //   name: 'Neon Sign Lights',
    //   image: 'https://readdy.ai/api/search-image?query=modern neon sign lights glowing in contemporary space with vibrant colors and sleek design creative lighting solutions&width=800&height=600&seq=category-8&orientation=landscape',
    // },
    {
      name: 'Alluminium Profile',
      image: 'https://readdy.ai/api/search-image?query=aluminum profile lighting fixtures with premium construction and modern design lighting infrastructure&width=800&height=600&seq=category-9&orientation=landscape',
    },
    {
      name: 'Power Accessories',
      image: 'https://readdy.ai/api/search-image?query=power accessories and electrical components for lighting systems professional quality equipment&width=800&height=600&seq=category-10&orientation=landscape',
    },
  ]

  return (
    <section id="learn" className="py-16 px-6 lg:px-8 bg-gradient-to-b from-white to-neutral-50 scroll-mt-24">
      <div className="w-full px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-4xl lg:text-5xl font-light text-neutral-900">
            Explore by Category
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Browse our extensive collection organized by lighting type to find the perfect piece for every space
          </p>
        </div>
        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              onClick={() => {
                navigate(`/collection?category=${encodeURIComponent(category.name)}`)
                window.scrollTo(0, 0)
              }}
              className="group relative overflow-hidden rounded-2xl bg-white border border-neutral-200/60 transition-all duration-300 hover:shadow-xl hover:shadow-neutral-900/10 hover:-translate-y-1 hover:border-neutral-300 cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
              </div>
              {/* Category Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-medium mb-1 group-hover:translate-x-1 transition-transform duration-300">
                  {category.name}
                </h3>
                <p className="text-sm text-white/90 group-hover:translate-x-1 transition-transform duration-300">
                  {products.filter(p => p.category === category.name).length} Products
                </p>
              </div>
              {/* Arrow Icon */}
              <div className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                <i className="ri-arrow-right-line text-white"></i>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductCategories
