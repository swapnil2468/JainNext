import React from 'react'

const Navbar = ({setToken}) => {
  return (
    <div className='flex items-center py-3 px-[4%] justify-end bg-white border-b border-gray-200'>
        <button onClick={()=>setToken('')} className='bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium text-sm'>
          Logout
        </button>
    </div>
  )
}

export default Navbar