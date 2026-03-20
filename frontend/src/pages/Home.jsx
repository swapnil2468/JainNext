import React from 'react'
import Hero from '../components/Hero'
import BestSeller from '../components/BestSeller'
import ProductCategories from '../components/ProductCategories'
import WholesaleBanner from '../components/WholesaleBanner'
import WhyChooseUs from '../components/WhyChooseUs'
import NewsletterBox from '../components/NewsletterBox'

const Home = () => {
  return (
    <div className='w-full bg-gradient-to-b from-neutral-50 via-white to-neutral-50'>
      <Hero />
      <BestSeller />
      <ProductCategories />
      <WholesaleBanner />
      <WhyChooseUs />
      <NewsletterBox />
    </div>
  )
}

export default Home