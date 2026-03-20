import React, { useContext, useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

const Navbar = () => {

  const [visible, setVisible] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const {setShowSearch , getCartCount , navigate, token, logout, setSelectedCategory, setSelectedSubCategory} = useContext(ShopContext)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const categories = [
    { name:"LED String Lights", subs:["Pixel String Lights","Still/Static String Lights","Multi-Color String Lights","Remote-Control String Lights"]},
    { name:"Decorative Lights", subs:["Festival Motif Lights","Shape/Novelty Lights","Themed Decorative Lights","Hanging Decorative Lights"]},
    { name:"Curtain & Net Lights", subs:["Curtain Lights","Net/Jaal Lights","Waterfall Lights","Leaf/Pattern Curtain Lights"]},
    { name:"Strip & Rope Lights", subs:["LED Strip Lights","Magic/RGB Strip Lights","Neon Rope Lights"]},
    { name:"Flood & Outdoor Lights", subs:["Flood Lights","Lens Flood Lights","Sheet Flood Lights","Outdoor Waterproof Lights"]},
    { name:"Festival & Patriotic Lights", subs:["Tricolor Theme Lights","Festival Special Lights","Religious Theme Lights"]}
  ]

  return (
    <div className='relative font-sans tracking-normal antialiased'>

      {/* NAVBAR */}
      <nav className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'top-0 bg-white/95 backdrop-blur-lg shadow-sm border-b border-neutral-200'
          : 'top-0 bg-gradient-to-br from-rose-50/60 via-rose-50/20 to-transparent'
      }`}>

        <div className='w-full px-6 lg:px-8'>
          <div className='flex items-center justify-between h-20'>

            {/* LOGO */}
            <Link to='/' className='flex-shrink-0'>
              <img src={assets.logo} className='w-32' alt='Logo' />
            </Link>

        {/* CENTER NAV */}
        <div className='hidden md:flex items-center space-x-8'>

          {/* HOME */}
          <NavLink to='/' className='text-sm font-medium text-neutral-700 hover:text-rose-700 transition-colors duration-200 relative group'>
            Home
            <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-700 transition-all duration-300 group-hover:w-full'></span>
          </NavLink>

          {/* COLLECTION */}
          <div className='relative group' style={{ paddingBottom: '8px', marginBottom: '-8px' }}>
            <NavLink to='/collection' className={({isActive}) => isActive ? 'text-sm font-medium text-rose-700 relative' : 'text-sm font-medium text-neutral-700 hover:text-rose-700 transition-colors duration-200 relative'}>
              Collection
              <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-700 transition-all duration-300 group-hover:w-full'></span>
            </NavLink>

            {/* Invisible bridge to prevent gap */}
            <div className='absolute top-full left-0 w-full h-2 bg-transparent'></div>

            {/* MEGA MENU */}
            <div className='absolute left-1/2 -translate-x-1/2 top-full w-screen bg-white shadow-xl hidden group-hover:block z-50 border-t'>
              <div className='max-w-7xl mx-auto px-12 py-10 grid grid-cols-6 gap-10'>
                {categories.map((cat, i) => (
                  <div key={i}>
                    <p onClick={() => { setSelectedCategory([cat.name]); setSelectedSubCategory([]); navigate('/collection'); }} className='font-semibold text-gray-900 mb-4 cursor-pointer hover:text-rose-700'>
                      {cat.name}
                    </p>
                    <div className='flex flex-col gap-2'>
                      {cat.subs.map((sub, j) => (
                        <p key={j} onClick={() => { setSelectedCategory([cat.name]); setSelectedSubCategory([sub]); navigate('/collection'); }} className='text-gray-500 cursor-pointer hover:text-black text-sm'>
                          {sub}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ABOUT */}
          <NavLink to='/about' className={({isActive}) => isActive ? 'text-sm font-medium text-rose-700 relative group' : 'text-sm font-medium text-neutral-700 hover:text-rose-700 transition-colors duration-200 relative group'}>
            About Us
            <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-700 transition-all duration-300 group-hover:w-full'></span>
          </NavLink>

          {/* WHOLESALE */}
          <NavLink to='/wholesale' className={({isActive}) => isActive ? 'text-sm font-medium text-rose-700 relative group' : 'text-sm font-medium text-neutral-700 hover:text-rose-700 transition-colors duration-200 relative group'}>
            Wholesale
            <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-700 transition-all duration-300 group-hover:w-full'></span>
          </NavLink>

          {/* CONTACT */}
          <NavLink to='/contact' className={({isActive}) => isActive ? 'text-sm font-medium text-rose-700 relative group' : 'text-sm font-medium text-neutral-700 hover:text-rose-700 transition-colors duration-200 relative group'}>
            Contact
            <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-700 transition-all duration-300 group-hover:w-full'></span>
          </NavLink>
        </div>

        {/* RIGHT SIDE */}
        <div className='flex items-center space-x-6'>

          {/* SEARCH */}
          <button
            onClick={()=> { setShowSearch(true); navigate('/collection') }}
            className='text-neutral-700 hover:text-rose-700 transition-colors duration-200'
            aria-label="Search"
          >
            <i className='ri-search-line text-xl'></i>
          </button>

          {/* PROFILE */}
          <div className='relative group'>
            <button
              onClick={()=> token ? null : navigate('/login')}
              className='text-neutral-700 hover:text-rose-700 transition-colors duration-200'
              aria-label="Account"
            >
              <i className='ri-user-line text-xl'></i>
            </button>

            {token &&
            <div className='group-hover:block hidden absolute right-0 pt-3 z-50'>
              <div className='flex flex-col gap-2 w-40 py-3 px-4 bg-white text-neutral-600 text-sm font-medium rounded-lg shadow-lg border border-neutral-200'>
                <p onClick={()=>navigate('/profile')} className='cursor-pointer hover:text-rose-700 transition-colors duration-300 py-1'>My Profile</p>
                <p onClick={()=>navigate('/orders')} className='cursor-pointer hover:text-rose-700 transition-colors duration-300 py-1'>Orders</p>
                <p onClick={logout} className='cursor-pointer hover:text-rose-700 transition-colors duration-300 py-1'>Logout</p>
              </div>
            </div>}
          </div>

          {/* CART */}
          <Link to='/cart' className='text-neutral-700 hover:text-rose-700 transition-colors duration-200 relative' aria-label="Shopping Cart">
            <i className='ri-shopping-bag-line text-xl'></i>
            {getCartCount() > 0 && (
              <span className='absolute -top-2 -right-2 w-5 h-5 bg-rose-700 text-white text-xs font-bold flex items-center justify-center rounded-full'>
                {getCartCount()}
              </span>
            )}
          </Link>

          {/* MOBILE MENU */}
          <img
            onClick={()=>setVisible(true)}
            src={assets.menu_icon}
            className='w-5 cursor-pointer sm:hidden'
            alt=""
          />

        </div>

          </div>
        </div>
        </nav>

    </div>
  )
}

export default Navbar
