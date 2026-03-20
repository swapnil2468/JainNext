import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    role: { type: String, enum: ['retail', 'wholesale'], default: 'retail' },
    isApproved: { type: Boolean, default: false },
    isRevoked: { type: Boolean, default: false },    isRejected: { type: Boolean, default: false },    businessName: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    businessPhone: { type: String, default: '' },
    businessAddress: { type: String, default: '' },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null }
}, { minimize: false, timestamps: true })

const userModel = mongoose.models.user || mongoose.model('user',userSchema);

export default userModel