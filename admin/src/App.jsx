import React, { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Add from './pages/Add'
import Edit from './pages/Edit'
import List from './pages/List'
import Orders from './pages/Orders'
import Wholesale from './pages/Wholesale'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = '₹'

const App = () => {

  const [token, setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):'');

  useEffect(()=>{
    localStorage.setItem('token',token)
  },[token])

  return (
    <div className='bg-gray-100 h-screen w-screen overflow-hidden'>
      <ToastContainer />
      {token === ""
        ? <Login setToken={setToken} />
        : <>
          <Sidebar setToken={setToken} />
          <div className='ml-[22%] h-full overflow-auto text-gray-600 text-base'>
            <div className='ml-[max(5vw,25px)] mr-[max(5vw,25px)] my-8'>
              <Routes>
                <Route path='/add' element={<Add token={token} />} />
                <Route path='/edit/:productId' element={<Edit token={token} />} />
                <Route path='/list' element={<List token={token} />} />
                <Route path='/orders' element={<Orders token={token} />} />
                <Route path='/wholesale' element={<Wholesale token={token} />} />
              </Routes>
            </div>
          </div>
        </>
      }
    </div>
  )
}

export default App