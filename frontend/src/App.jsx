import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import Verify from './pages/Verify'
import Wholesale from './pages/Wholesale'
import ResetPassword from './pages/ResetPassword'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PromoBanner from './components/PromoBanner'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Component to handle scroll to top on route change
const ScrollToTop = () => {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return null;
}

const App = () => {
  return (
    <div className='w-full overflow-x-hidden'>
      {/* <PromoBanner /> */}
      <ToastContainer />
      <ScrollToTop />
      <Navbar />
      <Routes>
          <Route path='/' element={<Home />} />
            <Route path='/collection' element={<Collection />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/product/:productId' element={<Product />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/login' element={<Login />} />
            <Route path='/place-order' element={<PlaceOrder />} />
            <Route path='/orders' element={<Orders />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/verify' element={<Verify />} />
            <Route path='/wholesale' element={<Wholesale />} />
            <Route path='/reset-password' element={<ResetPassword />} />
        </Routes>
      <Footer />
    </div>
  )
}

export default App
