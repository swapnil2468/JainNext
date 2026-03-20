import validator from "validator";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import userModel from "../models/userModel.js";


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// Route for user login
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exists" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {

            const token = createToken(user._id)
            res.json({ success: true, token })

        }
        else {
            res.json({ success: false, message: 'Invalid credentials' })
        }

    } catch (error) {
        console.error('Error in user login:', error);
        res.json({ success: false, message: error.message })
    }
}

// Route for user register
const registerUser = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        // checking user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        // validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({ success: true, token })

    } catch (error) {
        console.error('Error in user registration:', error);
        res.json({ success: false, message: error.message })
    }
}

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        
        const {email,password} = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password,process.env.JWT_SECRET);
            res.json({success:true,token})
        } else {
            res.json({success:false,message:"Invalid credentials"})
        }

    } catch (error) {
        console.error('Error in admin login:', error);
        res.json({ success: false, message: error.message })
    }
}

// Route to get user profile
const getUserProfile = async (req, res) => {
    try {
        const userId = req.body.userId;
        const user = await userModel.findById(userId).select('-password');
        
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }

        res.json({ success: true, user })
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.json({ success: false, message: error.message })
    }
}

// Route for user to apply for wholesale account
const applyForWholesale = async (req, res) => {
    try {
        const { userId, businessName, gstNumber, businessPhone, businessAddress } = req.body;

        // Validate required business fields
        if (!businessName || !gstNumber || !businessPhone || !businessAddress) {
            return res.json({ success: false, message: "All business details are required" });
        }

        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Prevent already-approved users from accidentally losing their approval
        if (user.role === 'wholesale' && user.isApproved) {
            return res.json({ success: false, message: "Your wholesale account is already approved." });
        }

        // Update user to wholesale role with pending approval
        user.role = 'wholesale';
        user.isApproved = false;
        user.businessName = businessName;
        user.gstNumber = gstNumber;
        user.businessPhone = businessPhone;
        user.businessAddress = businessAddress;

        await user.save();

        res.json({ success: true, message: "Wholesale application submitted. Awaiting admin approval." });
    } catch (error) {
        console.error('Error applying for wholesale:', error);
        res.json({ success: false, message: error.message });
    }
}

// Admin route to get all wholesale applications/users
const getWholesaleUsers = async (req, res) => {
    try {
        const wholesaleUsers = await userModel.find({ role: 'wholesale' }).select('-password');
        res.json({ success: true, users: wholesaleUsers });
    } catch (error) {
        console.error('Error fetching wholesale users:', error);
        res.json({ success: false, message: error.message });
    }
}

// Admin route to approve/reject wholesale application
const updateWholesaleStatus = async (req, res) => {
    try {
        const { userId, isApproved, isRevoked, isRejected } = req.body;

        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.role !== 'wholesale') {
            return res.json({ success: false, message: "User is not a wholesale applicant" });
        }

        user.isApproved = isApproved !== undefined ? isApproved : user.isApproved;
        user.isRevoked = isRevoked !== undefined ? isRevoked : user.isRevoked;
        user.isRejected = isRejected !== undefined ? isRejected : user.isRejected;
        await user.save();

        let status = 'updated';
        if (isRejected) status = 'rejected';
        else if (isRevoked) status = 'revoked';
        else if (isApproved) status = 'approved';
        
        res.json({ success: true, message: `Wholesale application ${status}` });
    } catch (error) {
        console.error('Error updating wholesale status:', error);
        res.json({ success: false, message: error.message });
    }
}

const removeWholesaleApplication = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.role !== 'wholesale') {
            return res.json({ success: false, message: "User is not a wholesale applicant" });
        }

        // Reset wholesale fields
        user.businessName = '';
        user.gstNumber = '';
        user.businessPhone = '';
        user.businessAddress = '';
        user.businessDescription = '';
        user.isApproved = false;
        user.isRevoked = false;
        user.role = 'retail'; // Set back to retail user
        
        await user.save();

        res.json({ success: true, message: 'Wholesaler removed successfully' });
    } catch (error) {
        console.error('Error removing wholesale application:', error);
        res.json({ success: false, message: error.message });
    }
}

// ── Forgot / Reset Password ──────────────────────────────────────────────────

const createTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

// Step 1: User submits their email → send reset link
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) return res.json({ success: false, message: 'Email is required' })

        const user = await userModel.findOne({ email })
        // Always return success to prevent email enumeration
        if (!user) return res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' })

        // Generate a secure random token
        const token = crypto.randomBytes(32).toString('hex')
        user.resetPasswordToken   = token
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        await user.save()

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
        const resetUrl = `${frontendUrl}/reset-password?token=${token}`

        await createTransporter().sendMail({
            from: `"Jainnext Support" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Password Reset Request',
            html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
              <div style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:28px 32px;text-align:center">
                <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:-0.5px">Jainnext</h1>
                <p style="color:#fca5a5;margin:6px 0 0;font-size:13px">Decoration Lighting</p>
              </div>
              <div style="padding:32px">
                <h2 style="margin:0 0 8px;font-size:20px;color:#111">Reset your password</h2>
                <p style="color:#6b7280;margin:0 0 24px;font-size:14px;line-height:1.6">Hi ${user.name}, we received a request to reset the password for your Jainnext account. Click the button below to choose a new password.</p>
                <div style="text-align:center;margin-bottom:24px">
                  <a href="${resetUrl}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:bold;font-size:15px">Reset Password</a>
                </div>
                <p style="color:#9ca3af;font-size:12px;line-height:1.6">This link expires in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email — your password will not be changed.</p>
                <hr style="border:none;border-top:1px solid #f3f4f6;margin:20px 0"/>
                <p style="color:#9ca3af;font-size:11px">If the button doesn't work, copy and paste this link:<br/><a href="${resetUrl}" style="color:#dc2626;font-size:11px;word-break:break-all">${resetUrl}</a></p>
              </div>
            </div>`
        })

        res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' })
    } catch (error) {
        console.error('Error in forgotPassword:', error)
        res.json({ success: false, message: error.message })
    }
}

// Step 2: User submits new password with the token from email
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body
        if (!token || !password) return res.json({ success: false, message: 'Token and new password are required' })
        if (password.length < 8) return res.json({ success: false, message: 'Password must be at least 8 characters' })

        const user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() } // token must not be expired
        })

        if (!user) return res.json({ success: false, message: 'Reset link is invalid or has expired' })

        const salt = await bcrypt.genSalt(10)
        user.password             = await bcrypt.hash(password, salt)
        user.resetPasswordToken   = null
        user.resetPasswordExpires = null
        await user.save()

        res.json({ success: true, message: 'Password updated successfully! You can now log in.' })
    } catch (error) {
        console.error('Error in resetPassword:', error)
        res.json({ success: false, message: error.message })
    }
}


export { loginUser, registerUser, adminLogin, getUserProfile, applyForWholesale, getWholesaleUsers, updateWholesaleStatus, removeWholesaleApplication, forgotPassword, resetPassword }
