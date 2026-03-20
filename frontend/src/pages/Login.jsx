import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {

  // currentState: 'Login' | 'Sign Up' | 'Forgot'
  const [currentState, setCurrentState] = useState('Login');
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const { token, setToken, navigate, backendUrl, cartItems, syncCartToDatabase } = useContext(ShopContext)

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (currentState === 'Forgot') {
        const response = await axios.post(backendUrl + '/api/user/forgot-password', { email })
        if (response.data.success) {
          setForgotSent(true)
        } else {
          toast.error(response.data.message)
        }
        return
      }

      if (currentState === 'Sign Up') {
        const response = await axios.post(backendUrl + '/api/user/register', { name, email, password })
        if (response.data.success) {
          const newToken = response.data.token
          localStorage.setItem('token', newToken)
          if (Object.keys(cartItems).length > 0) {
            await syncCartToDatabase(cartItems, newToken)
          }
          setToken(newToken)
        } else {
          toast.error(response.data.message)
        }
      } else {
        const response = await axios.post(backendUrl + '/api/user/login', { email, password })
        if (response.data.success) {
          const newToken = response.data.token
          localStorage.setItem('token', newToken)
          if (Object.keys(cartItems).length > 0) {
            await syncCartToDatabase(cartItems, newToken)
          }
          setToken(newToken)
        } else {
          toast.error(response.data.message)
        }
      }
    } catch (error) {
      console.error('Login/Registration error:', error)
      toast.error(error.message)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) navigate('/')
  }, [token])

  // ── Forgot Password – success screen ──────────────────────────────
  if (currentState === 'Forgot' && forgotSent) {
    return (
      <div className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800 text-center'>
        <div className='w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl'>✉️</div>
        <h2 className='text-2xl font-semibold'>Check your inbox</h2>
        <p className='text-gray-500 text-sm leading-relaxed'>
          If <span className='font-medium text-gray-700'>{email}</span> is registered, we've sent a password reset link. Check your spam folder if you don't see it.
        </p>
        <button
          onClick={() => { setCurrentState('Login'); setForgotSent(false); setEmail('') }}
          className='text-red-600 text-sm font-medium hover:underline mt-2'
        >
          ← Back to Login
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto pt-20 gap-4 text-gray-800'>
      <div className='inline-flex items-center gap-2 mb-2 mt-10'>
        <p className='prata-regular text-3xl'>
          {currentState === 'Forgot' ? 'Reset Password' : currentState}
        </p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
      </div>

      {currentState === 'Forgot' ? (
        <>
          <p className='text-sm text-gray-500 text-center -mt-2'>
            Enter your email and we'll send you a reset link.
          </p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type='email'
            className='w-full px-3 py-2 border border-gray-300'
            placeholder='Your email address'
            required
          />
          <button
            type='submit'
            disabled={loading}
            className='bg-gradient-to-r from-red-600 to-red-700 text-white font-bold px-8 py-2 mt-2 w-full rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2'
          >
            {loading
              ? <><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />Sending…</>
              : 'Send Reset Link'}
          </button>
          <p
            onClick={() => setCurrentState('Login')}
            className='text-sm text-red-600 cursor-pointer hover:underline -mt-1'
          >
            ← Back to Login
          </p>
        </>
      ) : (
        <>
          {currentState === 'Sign Up' && (
            <input onChange={(e) => setName(e.target.value)} value={name} type='text' className='w-full px-3 py-2 border border-gray-300' placeholder='Name' required />
          )}
          <input onChange={(e) => setEmail(e.target.value)} value={email} type='email' className='w-full px-3 py-2 border border-gray-300' placeholder='Email' required />
          <input onChange={(e) => setPassword(e.target.value)} value={password} type='password' className='w-full px-3 py-2 border border-gray-300' placeholder='Password' required />
          <div className='w-full flex justify-between text-sm mt-[-8px]'>
            <p
              onClick={() => { setCurrentState('Forgot'); setForgotSent(false) }}
              className='cursor-pointer hover:text-red-600 transition-colors'
            >
              Forgot your password?
            </p>
            {currentState === 'Login'
              ? <p onClick={() => setCurrentState('Sign Up')} className='cursor-pointer'>Create account</p>
              : <p onClick={() => setCurrentState('Login')} className='cursor-pointer'>Login Here</p>}
          </div>
          <button
            type='submit'
            disabled={loading}
            className='bg-gradient-to-r from-red-600 to-red-700 text-white font-bold px-8 py-2 mt-4 rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px] transform hover:scale-105'
          >
            {loading ? (
              <><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />{currentState === 'Login' ? 'Signing In...' : 'Signing Up...'}</>
            ) : (currentState === 'Login' ? 'Sign In' : 'Sign Up')}
          </button>
        </>
      )}
    </form>
  )
}

export default Login
