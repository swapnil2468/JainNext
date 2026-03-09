import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

// Middleware to check if user is approved wholesale customer
const requireWholesaleApproved = async (req, res, next) => {
    try {
        const { token } = req.headers;

        if (!token) {
            return res.json({ success: false, message: 'Not Authorized' });
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(token_decode.id);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (user.role !== 'wholesale' || !user.isApproved) {
            return res.json({ success: false, message: 'Wholesale access not approved' });
        }

        req.body.userId = token_decode.id;
        req.user = user;
        next();

    } catch (error) {
        console.error('Wholesale auth error:', error);
        res.json({ success: false, message: error.message });
    }
}

// Helper to get user info from token (for filtering product prices)
const getUserFromToken = async (token) => {
    try {
        if (!token) return null;
        
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(token_decode.id);
        return user;
    } catch (error) {
        return null;
    }
}

export { requireWholesaleApproved, getUserFromToken }
