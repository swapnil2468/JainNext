import React from 'react'

const PromoBanner = () => {
  const messages = [
    '🚚 Free Shipping Above ₹1499',
    '🛍️ Wholesale Prices for Bulk Orders',
    '⚡ Limited Stock – Grab Your Lights Before They Sell Out'
  ]

  const repeated = [...messages, ...messages, ...messages, ...messages]

  return (
    <div className='bg-[#ae1a1a] text-white py-2 overflow-hidden'>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .marquee {
          display: flex;
          white-space: nowrap;
          width: max-content;
          animation: marquee 35s linear infinite;
        }

        .marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className='flex'>
        <div className='marquee'>
          {repeated.map((msg, i) => (
            <span key={i} className='px-12 mx-6 whitespace-nowrap'>
              {msg} •
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PromoBanner
