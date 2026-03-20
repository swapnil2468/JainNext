import React, { useContext, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const ResetPassword = () => {
  const { backendUrl, navigate } = useContext(ShopContext)
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // No token in URL → redirect to login
  useEffect(() => {
    if (!token) navigate('/login')
  }, [token])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const response = await axios.post(backendUrl + '/api/user/reset-password', { token, password })
      if (response.data.success) {
        setDone(true)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen ─────────────────────────────────────────────────
  if (done) {
    return (
      <div className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800 text-center'>
        <div className='w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl'>✅</div>
        <h2 className='text-2xl font-semibold'>Password updated!</h2>
        <p className='text-gray-500 text-sm'>Your password has been changed successfully. You can now log in with your new password.</p>
        <button
          onClick={() => navigate('/login')}
          className='bg-gradient-to-r from-red-600 to-red-700 text-white font-bold px-10 py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md mt-2'
        >
          Go to Login
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto pt-20 gap-4 text-gray-800'>
      <div className='inline-flex items-center gap-2 mb-2 mt-10'>
        <p className='prata-regular text-3xl'>New Password</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
      </div>
      <p className='text-sm text-gray-500 text-center -mt-2'>Choose a strong password of at least 8 characters.</p>

      {/* New password */}
      <div className='relative w-full'>
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type={showPass ? 'text' : 'password'}
          className='w-full px-3 py-2 border border-gray-300 pr-10'
          placeholder='New password'
          required
          minLength={8}
        />
        <button
          type='button'
          onClick={() => setShowPass(p => !p)}
          className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs'
        >
          {showPass ? 'Hide' : 'Show'}
        </button>
      </div>

      {/* Confirm password */}
      <div className='relative w-full'>
        <input
          onChange={(e) => setConfirm(e.target.value)}
          value={confirm}
          type={showConfirm ? 'text' : 'password'}
          className='w-full px-3 py-2 border border-gray-300 pr-10'
          placeholder='Confirm new password'
          required
        />
        <button
          type='button'
          onClick={() => setShowConfirm(p => !p)}
          className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs'
        >
          {showConfirm ? 'Hide' : 'Show'}
        </button>
      </div>

      {/* Password match indicator */}
      {confirm.length > 0 && (
        <p className={`text-xs w-full -mt-3 ${password === confirm ? 'text-green-600' : 'text-red-500'}`}>
          {password === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
        </p>
      )}

      <button
        type='submit'
        disabled={loading}
        className='bg-gradient-to-r from-red-600 to-red-700 text-white font-bold px-8 py-2 mt-2 w-full rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2'
      >
        {loading
          ? <><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />Updating…</>
          : 'Update Password'}
      </button>
    </form>
  )
}

export default ResetPassword
