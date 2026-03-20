import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = ({ setToken }) => {
  const [showMenu, setShowMenu] = useState(false)
  const location = useLocation()

  return (
    <div className='fixed left-0 top-0 w-[22%] h-screen border-r border-gray-200 bg-white flex flex-col overflow-auto z-40'>
      {/* Logo Section */}
      <div className='flex items-center gap-2 p-4 border-b border-gray-200'>
        <div className='w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg'>
          ❤
        </div>
        <div>
          <p className='font-bold text-gray-800 text-sm'>Jainnext Admin</p>
          <p className='text-xs text-gray-500'>Management Portal</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className='flex-1 flex flex-col gap-2 pt-6 px-4'>
        
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive ? 'bg-gray-100 text-gray-700' : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <span className='text-lg'>📊</span>
          <p className='text-sm'>Dashboard</p>
        </NavLink>

        <NavLink 
          to="/list" 
          className={() => {
            const isListSection = location.pathname.includes('/list') || location.pathname.includes('/add') || location.pathname.includes('/edit')
            return `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isListSection ? 'bg-red-100 text-red-600' : 'text-gray-600 hover:bg-gray-50'
            }`
          }}
        >
          <span className='text-lg'>📋</span>
          <p className='text-sm'>List Items</p>
        </NavLink>

        <NavLink 
          to="/orders" 
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive ? 'bg-red-100 text-red-600' : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <span className='text-lg'>📦</span>
          <p className='text-sm'>Orders</p>
        </NavLink>

        <NavLink 
          to="/wholesale" 
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive ? 'bg-red-100 text-red-600' : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <span className='text-lg'>👥</span>
          <p className='text-sm'>Wholesale Accounts</p>
        </NavLink>

        <div className='flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer'>
          <span className='text-lg'>⚙️</span>
          <p className='text-sm'>Settings</p>
        </div>

      </div>

      {/* User Profile Section with Dropdown Menu */}
      <div className='border-t border-gray-200 p-4 relative'>
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className='w-full flex items-center gap-3 hover:opacity-75 transition'
        >
          <div className='w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm'>
            A
          </div>
          <div className='text-left'>
            <p className='font-medium text-gray-800 text-sm'>Admin User</p>
            <p className='text-xs text-gray-500'>SUPER ADMIN</p>
          </div>
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className='absolute bottom-16 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50'>
            <button 
              onClick={() => { setShowMenu(false); }}
              className='w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 border-b border-gray-200'
            >
              <span>👤</span>
              <p className='text-sm'>Profile</p>
            </button>
            <button 
              onClick={() => { setShowMenu(false); }}
              className='w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50'
            >
              <span>⚙️</span>
              <p className='text-sm'>Settings</p>
            </button>
            <button 
              onClick={() => { setShowMenu(false); setToken(''); }}
              className='w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 border-t border-gray-200'
            >
              <span>🚪</span>
              <p className='text-sm font-medium'>Logout</p>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar