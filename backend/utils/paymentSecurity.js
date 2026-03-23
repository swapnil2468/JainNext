import crypto from 'crypto'

/**
 * Verify Razorpay payment signature
 * This is CRITICAL security check to prevent payment fraud
 */
export const verifyPaymentSignature = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
    try {
        // Create HMAC-SHA256 hash of order_id|payment_id
        const message = `${razorpay_order_id}|${razorpay_payment_id}`
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(message)
            .digest('hex')
        
        // Compare signatures
        const isValid = generatedSignature === razorpay_signature
        return isValid
    } catch (error) {
        return false
    }
}

/**
 * Verify webhook signature from Razorpay
 * Ensures webhooks come from legitimate Razorpay servers
 */
export const verifyWebhookSignature = (body, signature) => {
    try {
        const bodyString = typeof body === 'string' ? body : JSON.stringify(body)
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(bodyString)
            .digest('hex')
        
        return generatedSignature === signature
    } catch (error) {
        return false
    }
}

/**
 * Sanitize payment response to prevent tampering
 */
export const sanitizePaymentResponse = (response) => {
    return {
        razorpay_payment_id: response?.razorpay_payment_id?.trim() || '',
        razorpay_order_id: response?.razorpay_order_id?.trim() || '',
        razorpay_signature: response?.razorpay_signature?.trim() || '',
    }
}
