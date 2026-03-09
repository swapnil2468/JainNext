import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

const Navbar = () => {

  const [visible,setVisible] = useState(false)

  const {setShowSearch , getCartCount , navigate, token, setToken, setCartItems, setSelectedCategory, setSelectedSubCategory} = useContext(ShopContext)

  const logout = () => {
    navigate('/login')
    localStorage.removeItem('token')
    setToken('')
    setCartItems({})
  }

  const categories = [
    { name:"LED String Lights", subs:["Pixel String Lights","Still/Static String Lights","Multi-Color String Lights","Remote-Control String Lights"]},
    { name:"Decorative Lights", subs:["Festival Motif Lights","Shape/Novelty Lights","Themed Decorative Lights","Hanging Decorative Lights"]},
    { name:"Curtain & Net Lights", subs:["Curtain Lights","Net/Jaal Lights","Waterfall Lights","Leaf/Pattern Curtain Lights"]},
    { name:"Strip & Rope Lights", subs:["LED Strip Lights","Magic/RGB Strip Lights","Neon Rope Lights"]},
    { name:"Flood & Outdoor Lights", subs:["Flood Lights","Lens Flood Lights","Sheet Flood Lights","Outdoor Waterproof Lights"]},
    { name:"Festival & Patriotic Lights", subs:["Tricolor Theme Lights","Festival Special Lights","Religious Theme Lights"]}
  ]

  return (
    <div className='relative border-b'>

      {/* NAVBAR */}
      <div className='flex items-center justify-between h-[70px] font-medium'>

        {/* LOGO */}
        <Link to='/'>
          <img src={assets.logo} className='w-36' alt="" />
        </Link>

        {/* CENTER NAV */}
        <ul className='hidden sm:flex gap-10 text-sm text-gray-700 h-full items-end pb-2'>

          {/* HOME */}
          <div className='group flex flex-col items-center'>
            <NavLink to='/'>
              <p>HOME</p>
            </NavLink>
            <span className='h-[2px] w-0 bg-red-600 group-hover:w-full transition-all duration-300 mt-2'/>
          </div>

          {/* COLLECTION */}
          <div className='relative group flex flex-col items-center'>

            <NavLink to='/collection' className='flex flex-col items-center'>
              <p>COLLECTION</p>
              <span className='h-[2px] w-0 bg-red-600 group-hover:w-full transition-all duration-300 mt-2'/>
            </NavLink>

            {/* MEGA MENU */}
            <div className='absolute left-1/2 -translate-x-1/2 
                            top-full w-screen
                            bg-white shadow-xl
                            hidden group-hover:block 
                            z-50 border-t'>

              <div className='max-w-7xl mx-auto px-12 py-10 grid grid-cols-6 gap-10'>

                {categories.map((cat,i)=>(
                  <div key={i}>
                    <p
                      onClick={()=>{
                        setSelectedCategory([cat.name]);
                        setSelectedSubCategory([]);
                        navigate('/collection');
                      }}
                      className='font-semibold text-gray-900 mb-4 cursor-pointer hover:text-red-600'
                    >
                      {cat.name}
                    </p>

                    <div className='flex flex-col gap-2'>
                      {cat.subs.map((sub,j)=>(
                        <p
                          key={j}
                          onClick={()=>{
                            setSelectedCategory([cat.name]);
                            setSelectedSubCategory([sub]);
                            navigate('/collection');
                          }}
                          className='text-gray-500 cursor-pointer hover:text-black text-sm'
                        >
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
          <div className='group flex flex-col items-center'>
            <NavLink to='/about'>
              <p>ABOUT</p>
            </NavLink>
            <span className='h-[2px] w-0 bg-red-600 group-hover:w-full transition-all duration-300 mt-2'/>
          </div>

          {/* WHOLESALE */}
          <div className='group flex flex-col items-center'>
            <NavLink to='/wholesale'>
              <p className='text-red-600 font-bold'>WHOLESALE</p>
            </NavLink>
            <span className='h-[2px] w-0 bg-red-600 group-hover:w-full transition-all duration-300 mt-2'/>
          </div>

          {/* CONTACT */}
          <div className='group flex flex-col items-center'>
            <NavLink to='/contact'>
              <p>CONTACT</p>
            </NavLink>
            <span className='h-[2px] w-0 bg-red-600 group-hover:w-full transition-all duration-300 mt-2'/>
          </div>

        </ul>

        {/* RIGHT SIDE */}
        <div className='flex items-center gap-6'>

          <img
            onClick={()=> { setShowSearch(true); navigate('/collection') }}
            src={assets.search_icon}
            className='w-5 cursor-pointer'
            alt=""
          />

          {/* PROFILE */}
          <div className='group relative'>
            <img
              onClick={()=> token ? null : navigate('/login')}
              className='w-5 cursor-pointer'
              src={assets.profile_icon}
              alt=""
            />

            {token &&
            <div className='group-hover:block hidden absolute right-0 pt-4 z-50'>
              <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded'>
                <p onClick={()=>navigate('/profile')} className='cursor-pointer hover:text-black'>My Profile</p>
                <p onClick={()=>navigate('/orders')} className='cursor-pointer hover:text-black'>Orders</p>
                <p onClick={logout} className='cursor-pointer hover:text-black'>Logout</p>
              </div>
            </div>}
          </div>

          {/* CART */}
          <Link to='/cart' className='relative'>
            <img src={assets.cart_icon} className='w-5' alt="" />
            <p className='absolute right-[-5px] bottom-[-5px] w-5 h-5 text-center leading-5 bg-red-600 text-white rounded-full text-[9px] font-semibold'>
              {getCartCount()}
            </p>
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
  )
}

export default Navbar
