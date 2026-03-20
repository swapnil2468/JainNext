import express from 'express';
import { loginUser, registerUser, adminLogin, getUserProfile, applyForWholesale, getWholesaleUsers, updateWholesaleStatus, removeWholesaleApplication, forgotPassword, resetPassword } from '../controllers/userController.js';
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
userRouter.post('/profile', authUser, getUserProfile)
userRouter.post('/forgot-password', forgotPassword)
userRouter.post('/reset-password', resetPassword)

// Wholesale routes
userRouter.post('/apply-wholesale', authUser, applyForWholesale)
userRouter.get('/wholesale-users', adminAuth, getWholesaleUsers)
userRouter.post('/update-wholesale-status', adminAuth, updateWholesaleStatus)
userRouter.post('/remove-wholesale-application', adminAuth, removeWholesaleApplication)

export default userRouter;