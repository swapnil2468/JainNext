import React, { useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'

// Razorpay payments are verified inline via the SDK callback in PlaceOrder.jsx.
// This page is kept as a safety redirect for any stale /verify links.
const Verify = () => {
    const { navigate } = useContext(ShopContext)

    useEffect(() => {
        navigate('/orders')
    }, [])

    return null
}

export default Verify