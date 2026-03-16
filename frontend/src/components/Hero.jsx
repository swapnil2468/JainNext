import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'

const Hero = () => {
  const heroCards = [
    {
      id: 1,
      title: 'Latest Collection',
      subtitle: 'Explore our newest lighting solutions',
      image: assets.img12,
      imagePosition: 'center 59%',
      subtitlePosition: 'top',
    },
    {
      id: 2,
      title: 'Premium Selection',
      subtitle: 'Handpicked pieces for your space',
      image: assets.img13,
      imagePosition: 'center 60%',
      subtitlePosition: 'top',
    },
    {
      id: 3,
      title: 'Exclusive Designs',
      subtitle: 'Limited edition lighting fixtures',
      image: assets.img14,
      imagePosition: 'center 60%',
      subtitlePosition: 'center',
    },
    {
      id: 4,
      title: 'Best Sellers',
      subtitle: 'Customer favorites this season',
      image: assets.img16,
      imagePosition: 'center 60%',
      subtitlePosition: 'bottom',
    }
  ]

  const [currentCard, setCurrentCard] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % heroCards.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrentCard((prev) => (prev - 1 + heroCards.length) % heroCards.length);
  };

  const handleNext = () => {
    setCurrentCard((prev) => (prev + 1) % heroCards.length);
  };

  const card = heroCards[currentCard];

  return (
    <div className='relative w-full'>
      <style>{`
        @keyframes slideInRight {
          from { 
            opacity: 0; 
            transform: translateX(150px);
          }
          to { 
            opacity: 1; 
            transform: translateX(0);
          }
        }

        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(150px);
          }
        }
        
        .slide-fade {
          animation: slideInRight 0.2s ease-in-out;
        }

        .slide-fade-out {
          animation: slideOutRight 0.15s ease-in-out;
        }

        @keyframes arrowHover {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }

        .arrow-button:hover {
          animation: arrowHover 0.6s ease-in-out;
        }
      `}</style>

      {/* Full-Bleed Hero Container */}
      <div key={currentCard} className='slide-fade relative h-[550px] group cursor-pointer mt-6'>
        {/* Left Click Zone */}
        <div 
          onClick={handlePrev}
          className='absolute left-0 top-0 w-1/5 h-full z-10 hover:bg-black/10 transition-colors'
        ></div>

        {/* Right Click Zone */}
        <div 
          onClick={handleNext}
          className='absolute right-0 top-0 w-1/5 h-full z-10 hover:bg-black/10 transition-colors'
        ></div>
        {/* Background Image */}
        <div className='absolute inset-0 w-full h-full'>
          <img 
            className='w-full h-full object-cover' 
            style={{ objectPosition: card.imagePosition }}
            src={card.image} 
            alt={card.title} 
          />
        </div>

        {/* Dark Gradient Overlay */}
        <div className='absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent'></div>

        {/* Content Area - Left Aligned */}
        <div className='absolute inset-0 flex flex-col justify-between p-6 sm:p-8 md:p-10'>
          {/* Top Spacing */}
          <div className='flex justify-between items-start'>
            <div></div>
          </div>

          {/* Middle: Main Content */}
          <div className={`flex absolute inset-0 p-6 sm:p-8 md:p-10 ${
            card.subtitlePosition === 'top' ? 'items-start pt-16' : 
            card.subtitlePosition === 'bottom' ? 'items-end pb-16' : 
            'items-center'
          }`}>
            <div className='text-white space-y-4 max-w-2xl'>
              {/* Decorative Line */}
              <div className='flex items-center gap-3'>
                <div className='w-12 h-1 bg-red-600'></div>
              </div>

              {/* Title */}
              <h1 className='prata-regular text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white'>
                {card.title}
              </h1>

              {/* Subtitle */}
              <p className='text-base md:text-lg text-white font-medium max-w-md drop-shadow-lg'>
                {card.subtitle}
              </p>

              {/* CTA Button */}
              <div className='pt-4'>
                <button className='group flex items-center gap-3 text-white hover:text-red-600 transition-all duration-300 font-semibold'>
                  <span className='text-sm md:text-base tracking-wider'>SHOP NOW</span>
                  <div className='w-8 h-[2px] bg-white group-hover:bg-red-600 group-hover:w-12 transition-all duration-300'></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Slide Indicators */}
        <div className='absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-2'>
          {/* Indicators */}
          <div className='flex gap-2'>
            {heroCards.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentCard(index)}
                className={`transition-all duration-300 ${
                  index === currentCard 
                    ? 'bg-white w-6 h-0.5' 
                    : 'bg-gray-400 w-1.5 h-0.5 hover:bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
