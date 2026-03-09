import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'
import RecentlyViewed from '../components/RecentlyViewed'
import WholesaleBanner from '../components/WholesaleBanner'

const Home = () => {
  return (
    <div>
      <Hero />
      <LatestCollection/>
      <WholesaleBanner/>
      <BestSeller/>
      <RecentlyViewed/>
      <OurPolicy/>
      <NewsletterBox/>
    </div>
  )
}

export default Home
