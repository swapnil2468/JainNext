import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'

const Login = () => {
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

  // ── Google OAuth handler ──────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(backendUrl + '/api/user/google-login', {
        credential: credentialResponse.credential
      })
      if (response.data.success) {
        const newToken = response.data.token
        localStorage.setItem('token', newToken)
        if (Object.keys(cartItems).length > 0) {
          await syncCartToDatabase(cartItems, newToken)
        }
        setToken(newToken)
        toast.success('Signed in with Google!')
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Google login error:', error)
      toast.error('Google sign-in failed. Please try again.')
    }
  }

  const handleGoogleError = () => {
    toast.error('Google sign-in was cancelled or failed.')
  }

  useEffect(() => {
    if (token) navigate('/')
  }, [token])

  // ── Forgot Password – success screen ──────────────────────────────
  if (currentState === 'Forgot' && forgotSent) {
    return (
      <div className='min-h-[80vh] flex items-center justify-center px-4'>
        <div className='w-full max-w-md text-center'>
          <div className='flex items-center justify-center gap-3 mb-8'>
            <div className='h-px w-12 bg-red-200' />
            <div className='w-2 h-2 rounded-full bg-red-400' />
            <div className='h-px w-12 bg-red-200' />
          </div>
          <div className='w-20 h-20 rounded-full bg-gradient-to-br from-red-50 to-red-100 border border-red-200 flex items-center justify-center text-3xl mx-auto mb-6 shadow-sm'>
            ✉️
          </div>
          <h2 className='prata-regular text-3xl text-neutral-800 mb-3'>Check your inbox</h2>
          <p className='text-neutral-500 text-sm leading-relaxed mb-8'>
            If <span className='font-medium text-neutral-700'>{email}</span> is registered,
            we've sent a password reset link. Check your spam folder if you don't see it.
          </p>
          <button
            onClick={() => { setCurrentState('Login'); setForgotSent(false); setEmail('') }}
            className='inline-flex items-center gap-2 text-red-600 text-sm font-medium hover:gap-3 transition-all duration-200'
          >
            <span>←</span> Back to Login
          </button>
        </div>
      </div>
    )
  }

  const inputClass = 'w-full px-4 py-3.5 bg-white border border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 transition-all duration-200'

  const getTitle = () => {
    if (currentState === 'Forgot') return 'Reset Password'
    if (currentState === 'Sign Up') return 'Create Account'
    return 'Welcome Back'
  }

  const getSubtitle = () => {
    if (currentState === 'Forgot') return "Enter your email and we'll send you a reset link."
    if (currentState === 'Sign Up') return 'Join us and start shopping today.'
    return 'Sign in to your account to continue.'
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className='min-h-[85vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-neutral-50 via-white to-neutral-50'>

        {/* Background decorative blobs */}
        <div className='fixed inset-0 pointer-events-none overflow-hidden'>
          <div className='absolute -top-32 -right-32 w-96 h-96 rounded-full bg-red-50 opacity-60 blur-3xl' />
          <div className='absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-neutral-100 opacity-80 blur-3xl' />
        </div>

        <div className='relative w-full max-w-md'>

          {/* Card */}
          <div className='bg-white border border-neutral-100 rounded-2xl shadow-xl shadow-neutral-100 px-8 py-10'>

            {/* Header */}
            <div className='mb-8'>
              <div className='flex items-center gap-2 mb-5'>
                <div className='h-0.5 w-6 bg-red-500 rounded-full' />
                <span className='text-red-500 text-xs font-semibold uppercase tracking-widest'>
                  {currentState === 'Sign Up' ? 'New Account' : currentState === 'Forgot' ? 'Recovery' : 'Account'}
                </span>
              </div>
              <h1 className='prata-regular text-3xl text-neutral-900 mb-1.5'>{getTitle()}</h1>
              <p className='text-neutral-400 text-sm'>{getSubtitle()}</p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmitHandler} className='flex flex-col gap-3.5'>

              {currentState === 'Forgot' ? (
                <>
                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    type='email'
                    className={inputClass}
                    placeholder='Your email address'
                    required
                  />
                  <button
                    type='submit'
                    disabled={loading}
                    className='w-full bg-neutral-900 hover:bg-red-600 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-1 shadow-sm'
                  >
                    {loading
                      ? <><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />Sending…</>
                      : 'Send Reset Link'}
                  </button>
                  <button
                    type='button'
                    onClick={() => setCurrentState('Login')}
                    className='text-sm text-neutral-400 hover:text-red-600 transition-colors text-center mt-1'
                  >
                    ← Back to Login
                  </button>
                </>
              ) : (
                <>
                  {currentState === 'Sign Up' && (
                    <input
                      onChange={(e) => setName(e.target.value)}
                      value={name}
                      type='text'
                      className={inputClass}
                      placeholder='Full name'
                      required
                    />
                  )}

                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    type='email'
                    className={inputClass}
                    placeholder='Email address'
                    required
                  />

                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    type='password'
                    className={inputClass}
                    placeholder='Password'
                    required
                  />

                  {currentState === 'Login' && (
                    <div className='flex justify-end -mt-1'>
                      <button
                        type='button'
                        onClick={() => { setCurrentState('Forgot'); setForgotSent(false) }}
                        className='text-xs text-neutral-400 hover:text-red-600 transition-colors'
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type='submit'
                    disabled={loading}
                    className='w-full bg-neutral-900 hover:bg-red-600 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {loading ? (
                      <>
                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                        {currentState === 'Login' ? 'Signing in…' : 'Creating account…'}
                      </>
                    ) : (
                      currentState === 'Login' ? 'Sign In' : 'Create Account'
                    )}
                  </button>

                  {/* Divider */}
                  <div className='flex items-center gap-3 my-1'>
                    <div className='flex-1 h-px bg-neutral-100' />
                    <span className='text-xs text-neutral-300 uppercase tracking-wider'>or</span>
                    <div className='flex-1 h-px bg-neutral-100' />
                  </div>

                  {/* ── Google Login Button ── */}
                  <div className='flex justify-center'>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      theme='outline'
                      size='large'
                      shape='rectangular'
                      width='368'
                      text={currentState === 'Sign Up' ? 'signup_with' : 'signin_with'}
                    />
                  </div>

                  {/* Toggle sign in / sign up */}
                  <div className='text-center text-sm text-neutral-400 mt-1'>
                    {currentState === 'Login' ? (
                      <>
                        Don't have an account?{' '}
                        <button
                          type='button'
                          onClick={() => setCurrentState('Sign Up')}
                          className='text-neutral-800 font-semibold hover:text-red-600 transition-colors'
                        >
                          Sign up
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{' '}
                        <button
                          type='button'
                          onClick={() => setCurrentState('Login')}
                          className='text-neutral-800 font-semibold hover:text-red-600 transition-colors'
                        >
                          Sign in
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Bottom trust line */}
          <p className='text-center text-xs text-neutral-300 mt-5'>
            Secured with 256-bit encryption · Your data stays private
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}

export default Login