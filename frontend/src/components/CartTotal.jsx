import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';

const CartTotal = () => {

    const {currency,delivery_fee,getCartAmount} = useContext(ShopContext);

  return (
    <div className='w-full space-y-4'>
      <div className='flex flex-col gap-3 py-5'>
            <div className='flex justify-between items-center border-b border-neutral-200 pb-4'>
                <p className='text-sm font-medium text-neutral-600 uppercase tracking-wide'>Subtotal</p>
                <p className='text-lg font-bold text-neutral-900'>{currency} {getCartAmount()}</p>
            </div>
            <div className='flex justify-between items-center border-b border-neutral-200 pb-4'>
                <p className='text-sm font-medium text-neutral-600 uppercase tracking-wide'>Shipping Fee</p>
                <p className='text-lg font-bold text-neutral-900'>{currency} {delivery_fee}</p>
            </div>
            <div className='flex justify-between items-center pt-2'>
                <p className='text-lg font-bold text-neutral-900 uppercase tracking-wide'>Total</p>
                <p className='text-2xl font-bold bg-gradient-to-r from-rose-500 to-rose-600 bg-clip-text text-transparent'>{currency} {getCartAmount() === 0 ? 0 : getCartAmount() + delivery_fee}</p>
            </div>
      </div>
    </div>
  )
}

export default CartTotal
