import express from 'express'
import {placeOrder, placeOrderRazorpay, allOrders, userOrders, updateStatus, verifyRazorpay, deleteOrder, cancelOrder} from '../controllers/orderController.js'
import adminAuth  from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'
import { paymentRateLimit } from '../middleware/paymentRateLimit.js'

const orderRouter = express.Router()

// Admin Features
orderRouter.post('/list',adminAuth,allOrders)
orderRouter.post('/status',adminAuth,updateStatus)
orderRouter.post('/delete',adminAuth,deleteOrder)

// Payment Features
orderRouter.post('/place',authUser,placeOrder)
orderRouter.post('/razorpay',authUser,paymentRateLimit,placeOrderRazorpay)

// User Feature 
orderRouter.post('/userorders',authUser,userOrders)
orderRouter.post('/cancel',authUser,cancelOrder)

// verify payment - with rate limit to prevent brute force signature verification attempts
orderRouter.post('/verifyRazorpay',authUser,paymentRateLimit,verifyRazorpay)

export default orderRouter