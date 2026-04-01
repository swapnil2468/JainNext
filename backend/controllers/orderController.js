import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

import razorpay from 'razorpay'
import productModel from '../models/productModel.js'
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail, sendOrderStatusEmail } from '../utils/orderEmails.js'
import { verifyPaymentSignature, sanitizePaymentResponse } from '../utils/paymentSecurity.js'

// global variables
const currency = 'inr'
const deliveryCharge = 0

// ---------------------------------------------------------------------------
// SHARED HELPERS
// ---------------------------------------------------------------------------

/**
 * Parse a variant string (both old "Green" and new "color:Green::length:5m"
 * formats) into an attribute map. Returns null for old-format strings so
 * callers can fall back to a colour-only match.
 */
const parseVariantString = (variantString) => {
    if (variantString && variantString.includes(':') && variantString.includes('::')) {
        const attributes = {}
        variantString.split('::').forEach(pair => {
            const [type, value] = pair.split(':')
            if (type && value) attributes[type] = value
        })
        return attributes
    }
    return null // old colour-only format
}

/**
 * Return the first variant object that matches variantString.
 * Works for both the old colour-only format and the new attribute format.
 */
const findVariant = (product, variantString) => {
    const attributes = parseVariantString(variantString)
    if (attributes) {
        return product.variants.find(v => {
            for (const [type, value] of Object.entries(attributes)) {
                const variantValue = type === 'color'
                    ? (v.color || v.attributes?.color)
                    : v.attributes?.[type]
                if (variantValue !== value) return false
            }
            return true
        })
    }
    // Old format — match by colour
    return product.variants.find(v => v.color === variantString)
}

/**
 * Same as findVariant but returns the array index (useful for $inc paths).
 */
const findVariantIndex = (product, variantString) => {
    const attributes = parseVariantString(variantString)
    if (attributes) {
        return product.variants.findIndex(v => {
            for (const [type, value] of Object.entries(attributes)) {
                const variantValue = type === 'color'
                    ? (v.color || v.attributes?.color)
                    : v.attributes?.[type]
                if (variantValue !== value) return false
            }
            return true
        })
    }
    return product.variants.findIndex(v => v.color === variantString)
}

// ---------------------------------------------------------------------------
// SERVER-SIDE AMOUNT CALCULATION (fraud prevention)
// ---------------------------------------------------------------------------

/**
 * Recalculates the order total server-side so the client-supplied amount is
 * never trusted. Throws on unknown products.
 */
const calculateOrderTotal = async (items, userRole, userApproved) => {
    let totalAmount = 0

    for (const item of items) {
        const product = await productModel.findById(item._id)
        if (!product) throw new Error(`Product ${item._id} not found`)

        const minWholesaleQty = product.minimumWholesaleQuantity || 10
        let itemPrice

        if (item.selectedVariant && product.variants && product.variants.length > 0) {
            const variant = findVariant(product, item.selectedVariant)
            if (variant) {
                itemPrice = variant.price || product.retailPrice || product.price
                if (
                    userRole === 'wholesale' && userApproved &&
                    variant.wholesalePrice &&
                    item.quantity >= (variant.minimumWholesaleQuantity || minWholesaleQty)
                ) {
                    itemPrice = variant.wholesalePrice
                }
            } else {
                itemPrice = product.retailPrice || product.price
                if (userRole === 'wholesale' && userApproved && product.wholesalePrice &&
                    item.quantity >= minWholesaleQty) {
                    itemPrice = product.wholesalePrice
                }
            }
        } else {
            itemPrice = product.retailPrice || product.price
            if (userRole === 'wholesale' && userApproved && product.wholesalePrice &&
                item.quantity >= minWholesaleQty) {
                itemPrice = product.wholesalePrice
            }
        }

        totalAmount += itemPrice * item.quantity
    }

    totalAmount += deliveryCharge
    return totalAmount
}

// ---------------------------------------------------------------------------
// STOCK HELPERS
// ---------------------------------------------------------------------------

/**
 * Validates that wholesale users meet minimum quantity requirements for each item.
 * Returns { ok: true } or { ok: false, message: string }.
 */
const validateWholesaleQuantities = async (items, userRole, userIsApproved) => {
    if (userRole !== 'wholesale' || !userIsApproved) {
        return { ok: true }
    }

    for (const item of items) {
        const product = await productModel.findById(item._id)
        if (!product) continue

        const minQty = product.minimumWholesaleQuantity || 10

        if (item.quantity < minQty) {
            return { ok: false, message: `"${item.name}" requires minimum ${minQty} units for wholesale orders. You have ${item.quantity} in this order.` }
        }
    }
    return { ok: true }
}

/**
 * Validates that every item in the order has enough stock.
 * Returns { ok: true } or { ok: false, message: string }.
 */
const validateStock = async (items) => {
    for (const item of items) {
        const product = await productModel.findById(item._id)
        if (!product) {
            return { ok: false, message: `Product "${item.name}" is no longer available` }
        }

        if (product.variants && product.variants.length > 0 && item.selectedVariant) {
            const variant = findVariant(product, item.selectedVariant)
            if (!variant) {
                return { ok: false, message: `Variant "${item.selectedVariant}" is no longer available for "${item.name}"` }
            }
            if (variant.stock < item.quantity) {
                return { ok: false, message: `Insufficient stock for "${item.name}" (${item.selectedVariant}). Only ${variant.stock} available.` }
            }
        } else {
            if (product.stock < item.quantity) {
                return { ok: false, message: `Insufficient stock for "${item.name}". Only ${product.stock} available.` }
            }
        }
    }
    return { ok: true }
}

/**
 * Atomically deducts stock for each item.
 * Uses a conditional update ($gte guard) to eliminate the race condition
 * between a stock check and the actual deduction.
 *
 * Returns { ok: true } or { ok: false, message, failedItem }.
 */
const deductStock = async (items) => {
    const deducted = [] // track successful deductions for rollback

    for (const item of items) {
        const product = await productModel.findById(item._id)
        if (!product) {
            await rollbackStock(deducted)
            return { ok: false, message: `Product "${item.name}" is no longer available` }
        }

        if (product.variants && product.variants.length > 0 && item.selectedVariant) {
            const variantIndex = findVariantIndex(product, item.selectedVariant)
            if (variantIndex < 0) {
                await rollbackStock(deducted)
                return { ok: false, message: `Variant "${item.selectedVariant}" not found for "${item.name}"` }
            }

            // FIX: atomic conditional update — only deducts if stock is sufficient
            const updated = await productModel.findOneAndUpdate(
                {
                    _id: item._id,
                    [`variants.${variantIndex}.stock`]: { $gte: item.quantity }
                },
                { $inc: { [`variants.${variantIndex}.stock`]: -item.quantity } },
                { new: true }
            )

            if (!updated) {
                await rollbackStock(deducted)
                const fresh = await productModel.findById(item._id)
                const v = fresh?.variants?.[variantIndex]
                return {
                    ok: false,
                    message: `Insufficient stock for "${item.name}" (${item.selectedVariant}). Only ${v?.stock ?? 0} available.`
                }
            }

            deducted.push({ productId: item._id, variantIndex, quantity: item.quantity })

        } else {
            // FIX: atomic conditional update for non-variant products
            const updated = await productModel.findOneAndUpdate(
                { _id: item._id, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { new: true }
            )

            if (!updated) {
                await rollbackStock(deducted)
                const fresh = await productModel.findById(item._id)
                return {
                    ok: false,
                    message: `Insufficient stock for "${item.name}". Only ${fresh?.stock ?? 0} available.`
                }
            }

            deducted.push({ productId: item._id, variantIndex: null, quantity: item.quantity })
        }
    }

    return { ok: true }
}

/**
 * Rolls back previously deducted stock entries on failure.
 */
const rollbackStock = async (deducted) => {
    for (const entry of deducted) {
        if (entry.variantIndex !== null) {
            await productModel.findByIdAndUpdate(
                entry.productId,
                { $inc: { [`variants.${entry.variantIndex}.stock`]: entry.quantity } }
            )
        } else {
            await productModel.findByIdAndUpdate(
                entry.productId,
                { $inc: { stock: entry.quantity } }
            )
        }
    }
}

/**
 * Restores stock for all items in an order (used on cancellation).
 */
const restoreStock = async (items) => {
    for (const item of items) {
        const product = await productModel.findById(item._id)
        if (!product) continue // product deleted — nothing to restore

        if (item.selectedVariant && product.variants && product.variants.length > 0) {
            const variantIndex = findVariantIndex(product, item.selectedVariant)
            if (variantIndex >= 0) {
                await productModel.findByIdAndUpdate(
                    item._id,
                    { $inc: { [`variants.${variantIndex}.stock`]: item.quantity } }
                )
            }
        } else {
            await productModel.findByIdAndUpdate(
                item._id,
                { $inc: { stock: item.quantity } }
            )
        }
    }
}

// ---------------------------------------------------------------------------
// Lazy Razorpay initialisation
// ---------------------------------------------------------------------------

const getRazorpayInstance = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.')
    }
    return new razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
}

// ---------------------------------------------------------------------------
// PLACE ORDER — COD
// ---------------------------------------------------------------------------

const placeOrder = async (req, res) => {
    try {
        const { userId, items, address } = req.body

        const user = await userModel.findById(userId)
        if (!user) return res.json({ success: false, message: 'User not found' })

        let amount
        try {
            amount = await calculateOrderTotal(items, user.role, user.isApproved)
        } catch (error) {
            return res.json({ success: false, message: error.message })
        }

        // Validate wholesale minimum quantities
        const wholesaleCheck = await validateWholesaleQuantities(items, user.role, user.isApproved)
        if (!wholesaleCheck.ok) return res.json({ success: false, message: wholesaleCheck.message })

        // Pre-flight stock check (fast, non-mutating)
        const stockCheck = await validateStock(items)
        if (!stockCheck.ok) return res.json({ success: false, message: stockCheck.message })

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: 'COD',
            payment: false,
            date: Date.now(),
            statusHistory: [{ status: 'New', timestamp: new Date() }]
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        // FIX: atomic stock deduction with race-condition protection
        const deductResult = await deductStock(items)
        if (!deductResult.ok) {
            // Order was saved but stock could not be deducted — delete the order
            await orderModel.findByIdAndDelete(newOrder._id)
            return res.json({ success: false, message: deductResult.message })
        }

        await userModel.findByIdAndUpdate(userId, { cartData: {} })

        // Fire-and-forget emails
        sendOrderConfirmationEmail(newOrder, user.email, user.name)
        sendAdminNewOrderEmail(newOrder, user.name, user.email)

        res.json({ success: true, message: 'Order Placed' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ---------------------------------------------------------------------------
// PLACE ORDER — RAZORPAY (create Razorpay order & pending DB record)
// ---------------------------------------------------------------------------

const placeOrderRazorpay = async (req, res) => {
    try {
        const { userId, items, address } = req.body

        const user = await userModel.findById(userId)
        if (!user) return res.json({ success: false, message: 'User not found' })

        let amount
        try {
            amount = await calculateOrderTotal(items, user.role, user.isApproved)
        } catch (error) {
            return res.json({ success: false, message: error.message })
        }

        // Validate wholesale minimum quantities
        const wholesaleCheck = await validateWholesaleQuantities(items, user.role, user.isApproved)
        if (!wholesaleCheck.ok) return res.json({ success: false, message: wholesaleCheck.message })

        // Validate stock before creating the Razorpay order
        const stockCheck = await validateStock(items)
        if (!stockCheck.ok) return res.json({ success: false, message: stockCheck.message })

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: 'Razorpay',
            payment: false,
            date: Date.now(),
            statusHistory: [{ status: 'New', timestamp: new Date() }]
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const options = {
            amount: amount * 100, // paise
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString()
        }

        // FIX: removed erroneous `await` + callback mix.
        // Use the Promise API directly so the response is always sent.
        try {
            const razorpayOrder = await getRazorpayInstance().orders.create(options)
            return res.json({ success: true, order: razorpayOrder })
        } catch (razorpayError) {
            // Razorpay order creation failed — clean up the pending DB record
            await orderModel.findByIdAndDelete(newOrder._id)
            return res.json({ success: false, message: razorpayError.message || razorpayError })
        }

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ---------------------------------------------------------------------------
// VERIFY RAZORPAY PAYMENT
// ---------------------------------------------------------------------------

const verifyRazorpay = async (req, res) => {
    try {
        const { userId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Missing payment verification data' })
        }

        const sanitized = sanitizePaymentResponse({ razorpay_order_id, razorpay_payment_id, razorpay_signature })

        // Verify HMAC signature — rejects any tampered/fake callbacks
        const isSignatureValid = verifyPaymentSignature(
            sanitized.razorpay_order_id,
            sanitized.razorpay_payment_id,
            sanitized.razorpay_signature
        )

        if (!isSignatureValid) {
            return res.status(401).json({
                success: false,
                message: 'Payment verification failed — invalid signature.'
            })
        }

        // Confirm payment status with Razorpay (do not trust client data alone)
        const razorpayOrderInfo = await getRazorpayInstance().orders.fetch(sanitized.razorpay_order_id)

        if (!razorpayOrderInfo) {
            return res.status(404).json({ success: false, message: 'Order not found in Razorpay system' })
        }

        if (razorpayOrderInfo.status !== 'paid') {
            return res.status(400).json({
                success: false,
                message: `Payment status is "${razorpayOrderInfo.status}", not paid`
            })
        }

        // Fetch our internal order using the receipt field set at creation time
        const order = await orderModel.findById(razorpayOrderInfo.receipt)
        if (!order) {
            return res.status(404).json({ success: false, message: 'Internal order record not found' })
        }

        // Prevent double-processing if webhook/callback fires more than once
        if (order.payment === true) {
            return res.json({ success: true, message: 'Payment already verified' })
        }

        // Verify the amount Razorpay reports matches what we stored (fraud guard)
        const expectedAmountInPaise = Math.round(order.amount * 100)
        if (razorpayOrderInfo.amount !== expectedAmountInPaise) {
            // FIX: issue a refund before deleting the order so the customer is not charged
            try {
                await getRazorpayInstance().payments.refund(sanitized.razorpay_payment_id, {
                    amount: razorpayOrderInfo.amount // full refund
                })
            } catch (refundError) {
                console.error('Refund failed after amount mismatch:', refundError)
            }
            await orderModel.findByIdAndDelete(order._id)
            return res.status(400).json({
                success: false,
                message: `Payment amount mismatch. Expected ₹${order.amount} but received ₹${razorpayOrderInfo.amount / 100}. Order cancelled and refund initiated.`
            })
        }

        // FIX: atomic stock deduction with race-condition protection
        // If stock runs out here, refund the customer — do NOT silently delete the order
        const deductResult = await deductStock(order.items)
        if (!deductResult.ok) {
            try {
                await getRazorpayInstance().payments.refund(sanitized.razorpay_payment_id, {
                    amount: razorpayOrderInfo.amount
                })
            } catch (refundError) {
                console.error('Refund failed after stock exhaustion:', refundError)
            }
            await orderModel.findByIdAndDelete(order._id)
            return res.status(400).json({
                success: false,
                message: `${deductResult.message} Your payment has been refunded.`
            })
        }

        // All good — mark as paid and clear the cart
        await orderModel.findByIdAndUpdate(order._id, { payment: true })
        await userModel.findByIdAndUpdate(userId, { cartData: {} })

        // Fire-and-forget emails
        const paidOrder = await orderModel.findById(order._id)
        const paidUser = await userModel.findById(userId).select('name email')
        if (paidOrder && paidUser) {
            sendOrderConfirmationEmail(paidOrder, paidUser.email, paidUser.name)
            sendAdminNewOrderEmail(paidOrder, paidUser.name, paidUser.email)
        }

        res.json({ success: true, message: 'Payment Verified & Order Confirmed' })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// ---------------------------------------------------------------------------
// ADMIN — all orders
// ---------------------------------------------------------------------------

const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({})
        res.json({ success: true, orders })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ---------------------------------------------------------------------------
// USER — their own orders
// ---------------------------------------------------------------------------

const userOrders = async (req, res) => {
    try {
        const { userId } = req.body
        const orders = await orderModel.find({ userId })
        res.json({ success: true, orders })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ---------------------------------------------------------------------------
// ADMIN — update order status
// ---------------------------------------------------------------------------

const updateStatus = async (req, res) => {
    try {
        const { orderId, status, trackingNumber } = req.body

        const existingOrder = await orderModel.findById(orderId).select('status')
        if (!existingOrder) return res.json({ success: false, message: 'Order not found' })

        const statusChanged = existingOrder.status !== status

        const setFields = { status }
        if (trackingNumber !== undefined) setFields.trackingNumber = trackingNumber

        const updateOp = { $set: setFields }
        if (statusChanged) {
            updateOp.$push = { statusHistory: { status, timestamp: new Date() } }
        }

        await orderModel.findByIdAndUpdate(orderId, updateOp)

        if (statusChanged) {
            const updatedOrder = await orderModel.findById(orderId)
            if (updatedOrder) {
                const customer = await userModel.findById(updatedOrder.userId).select('name email')
                if (customer) {
                    sendOrderStatusEmail(updatedOrder, customer.email, customer.name, status, trackingNumber)
                }
            }
        }

        res.json({ success: true, message: 'Status Updated' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ---------------------------------------------------------------------------
// ADMIN — delete order
// ---------------------------------------------------------------------------

const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.body
        await orderModel.findByIdAndDelete(orderId)
        res.json({ success: true, message: 'Order deleted' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ---------------------------------------------------------------------------
// USER — cancel order
// ---------------------------------------------------------------------------

const cancelOrder = async (req, res) => {
    try {
        const { userId, orderId } = req.body

        const order = await orderModel.findById(orderId)
        if (!order) return res.json({ success: false, message: 'Order not found' })

        if (order.userId.toString() !== userId.toString()) {
            return res.json({ success: false, message: 'Unauthorized: this order does not belong to you' })
        }

        const hoursSincePlaced = (Date.now() - order.date) / (1000 * 60 * 60)
        if (hoursSincePlaced > 24) {
            return res.json({ success: false, message: 'Orders can only be cancelled within 24 hours of placing' })
        }

        if (order.status !== 'New') {
            return res.json({ success: false, message: 'Only new orders that have not been shipped can be cancelled' })
        }

        // FIX: use shared restoreStock helper (no duplicated logic)
        await restoreStock(order.items)

        await orderModel.findByIdAndUpdate(orderId, {
            status: 'Cancelled',
            $push: { statusHistory: { status: 'Cancelled', timestamp: new Date() } }
        })

        // Fire-and-forget email
        const cancelledOrder = await orderModel.findById(orderId)
        const cancelledUser = await userModel.findById(userId).select('name email')
        if (cancelledOrder && cancelledUser) {
            sendOrderStatusEmail(cancelledOrder, cancelledUser.email, cancelledUser.name, 'Cancelled')
        }

        res.json({ success: true, message: 'Order cancelled successfully' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export { verifyRazorpay, placeOrder, placeOrderRazorpay, allOrders, userOrders, updateStatus, deleteOrder, cancelOrder }