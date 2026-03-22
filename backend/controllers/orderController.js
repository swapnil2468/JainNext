import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

import razorpay from 'razorpay'
import productModel from '../models/productModel.js'
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail, sendOrderStatusEmail } from '../utils/orderEmails.js'

// global variables
const currency = 'inr'
const deliveryCharge = 10

// Lazy-initialize Razorpay only when a payment is actually attempted
// (avoids crashing the entire orders module if keys are not configured)
const getRazorpayInstance = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.')
    }
    return new razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
}

// Placing orders using COD Method
const placeOrder = async (req,res) => {
    
    try {
        
        const { userId, items, amount, address} = req.body;

        // Helper function to find variant by parsed attributes
        const findVariantByAttributes = (product, variantString) => {
            // variantString can be two formats:
            // OLD: just color value ("Green")
            // NEW: formatted attributes ("Green - 5m") or raw attributes ("color:Green::length:5m")
            
            // Try new format first (raw attributes: "color:Green::length:5m")
            if (variantString.includes(':') && variantString.includes('::')) {
                const attributes = {}
                const pairs = variantString.split('::')
                pairs.forEach(pair => {
                    const [type, value] = pair.split(':')
                    if (type && value) attributes[type] = value
                })
                
                return product.variants.find(v => {
                    for (const [type, value] of Object.entries(attributes)) {
                        const variantValue = type === 'color' ? (v.color || v.attributes?.color) : v.attributes?.[type]
                        if (variantValue !== value) return false
                    }
                    return true
                })
            }
            
            // Fallback: treat as old format (just color)
            return product.variants.find(v => v.color === variantString)
        }
        
        // Validate stock availability BEFORE creating order
        for (const item of items) {
            const product = await productModel.findById(item._id);
            
            if (!product) {
                return res.json({success: false, message: `Product "${item.name}" is no longer available`});
            }
            
            // Check stock based on variant or non-variant
            if (product.variants && product.variants.length > 0 && item.selectedVariant) {
                // Variant product - check variant stock
                const variant = findVariantByAttributes(product, item.selectedVariant);
                if (!variant) {
                    return res.json({success: false, message: `Variant "${item.selectedVariant}" is no longer available for "${item.name}"`});
                }
                if (variant.stock < item.quantity) {
                    return res.json({success: false, message: `Insufficient stock for "${item.name}" (${item.selectedVariant}). Only ${variant.stock} available.`});
                }
            } else {
                // Non-variant product - check product stock
                if (product.stock < item.quantity) {
                    return res.json({success: false, message: `Insufficient stock for "${item.name}". Only ${product.stock} available.`});
                }
            }
        }

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"COD",
            payment:false,
            date: Date.now(),
            statusHistory: [{ status: 'New', timestamp: new Date() }]
        }

        // Save order first — deduct stock only after a successful save
        const newOrder = new orderModel(orderData)
        await newOrder.save()

        // Order saved — now deduct stock
        for (const item of items) {
            const product = await productModel.findById(item._id);
            
            if (product.variants && product.variants.length > 0 && item.selectedVariant) {
                // Variant product - deduct from variant stock
                // Use same helper to find variant
                const findVariantByAttributes = (product, variantString) => {
                    if (variantString.includes(':') && variantString.includes('::')) {
                        const attributes = {}
                        const pairs = variantString.split('::')
                        pairs.forEach(pair => {
                            const [type, value] = pair.split(':')
                            if (type && value) attributes[type] = value
                        })
                        return product.variants.findIndex(v => {
                            for (const [type, value] of Object.entries(attributes)) {
                                const variantValue = type === 'color' ? (v.color || v.attributes?.color) : v.attributes?.[type]
                                if (variantValue !== value) return false
                            }
                            return true
                        })
                    }
                    return product.variants.findIndex(v => v.color === variantString)
                }
                const variantIndex = findVariantByAttributes(product, item.selectedVariant);
                if (variantIndex >= 0) {
                    await productModel.findByIdAndUpdate(
                        item._id,
                        { $inc: { [`variants.${variantIndex}.stock`]: -item.quantity } },
                        { new: true }
                    );
                }
            } else {
                // Non-variant product - deduct from product stock
                await productModel.findByIdAndUpdate(
                    item._id,
                    { $inc: { stock: -item.quantity } },
                    { new: true }
                );
            }
        }

        await userModel.findByIdAndUpdate(userId,{cartData:{}})

        // Send confirmation email to customer + alert to admin (fire-and-forget)
        const user = await userModel.findById(userId).select('name email')
        if (user) {
            sendOrderConfirmationEmail(newOrder, user.email, user.name)
            sendAdminNewOrderEmail(newOrder, user.name, user.email)
        }

        res.json({success:true,message:"Order Placed"})


    } catch (error) {
        console.error('Error placing COD order:', error)
        res.json({success:false,message:error.message})
    }

}

// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req,res) => {
    try {
        
        const { userId, items, amount, address} = req.body

        // Helper function to find variant by parsed attributes (same as in placeOrder)
        const findVariantByAttributes = (product, variantString) => {
            // variantString can be two formats:
            // OLD: just color value ("Green")
            // NEW: formatted attributes ("Green - 5m") or raw attributes ("color:Green::length:5m")
            
            if (variantString.includes(':') && variantString.includes('::')) {
                const attributes = {}
                const pairs = variantString.split('::')
                pairs.forEach(pair => {
                    const [type, value] = pair.split(':')
                    if (type && value) attributes[type] = value
                })
                
                return product.variants.find(v => {
                    for (const [type, value] of Object.entries(attributes)) {
                        const variantValue = type === 'color' ? (v.color || v.attributes?.color) : v.attributes?.[type]
                        if (variantValue !== value) return false
                    }
                    return true
                })
            }
            
            return product.variants.find(v => v.color === variantString)
        }
        
        // Validate stock availability BEFORE creating order and initiating payment
        for (const item of items) {
            const product = await productModel.findById(item._id);
            
            if (!product) {
                return res.json({success: false, message: `Product "${item.name}" is no longer available`});
            }
            
            // Check stock based on variant or non-variant
            if (product.variants && product.variants.length > 0 && item.selectedVariant) {
                // Variant product - check variant stock
                const variant = findVariantByAttributes(product, item.selectedVariant);
                if (!variant) {
                    return res.json({success: false, message: `Variant "${item.selectedVariant}" is no longer available for "${item.name}"`});
                }
                if (variant.stock < item.quantity) {
                    return res.json({success: false, message: `Insufficient stock for "${item.name}" (${item.selectedVariant}). Only ${variant.stock} available.`});
                }
            } else {
                // Non-variant product - check product stock
                if (product.stock < item.quantity) {
                    return res.json({success: false, message: `Insufficient stock for "${item.name}". Only ${product.stock} available.`});
                }
            }
        }

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"Razorpay",
            payment:false,
            date: Date.now(),
            statusHistory: [{ status: 'New', timestamp: new Date() }]
        }

        // Note: Stock validated. Will be deducted after payment verification as double-check safety net.

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const options = {
            amount: amount * 100,
            currency: currency.toUpperCase(),
            receipt : newOrder._id.toString()
        }

        await getRazorpayInstance().orders.create(options, (error, order) => {
            if (error) {
                console.error('Razorpay order creation error:', error)
                return res.json({success:false, message: error})
            }
            res.json({success:true,order})
        })

    } catch (error) {
        console.error('Error placing Razorpay order:', error)
        res.json({success:false,message:error.message})
    }
}

const verifyRazorpay = async (req,res) => {
    try {
        
        const { userId, razorpay_order_id  } = req.body

        const orderInfo = await getRazorpayInstance().orders.fetch(razorpay_order_id)
        if (orderInfo.status === 'paid') {
            // Get order details to deduct stock
            const order = await orderModel.findById(orderInfo.receipt);
            
            if (!order) {
                return res.json({success: false, message: "Order not found"});
            }

            // Validate and deduct stock for each item
            for (const item of order.items) {
                const product = await productModel.findById(item._id);
                
                if (!product) {
                    // Product was deleted, cancel order
                    await orderModel.findByIdAndDelete(orderInfo.receipt);
                    return res.json({success: false, message: `Product ${item.name} is no longer available`});
                }
                
                // Helper function to find variant by parsed attributes
                const findVariantByAttributes = (product, variantString) => {
                    if (variantString.includes(':') && variantString.includes('::')) {
                        const attributes = {}
                        const pairs = variantString.split('::')
                        pairs.forEach(pair => {
                            const [type, value] = pair.split(':')
                            if (type && value) attributes[type] = value
                        })
                        return product.variants.find(v => {
                            for (const [type, value] of Object.entries(attributes)) {
                                const variantValue = type === 'color' ? (v.color || v.attributes?.color) : v.attributes?.[type]
                                if (variantValue !== value) return false
                            }
                            return true
                        })
                    }
                    return product.variants.find(v => v.color === variantString)
                }
                
                // Check stock based on variant or non-variant
                if (product.variants && product.variants.length > 0 && item.selectedVariant) {
                    // Variant product - check variant stock
                    const variant = findVariantByAttributes(product, item.selectedVariant);
                    if (!variant) {
                        await orderModel.findByIdAndDelete(orderInfo.receipt);
                        return res.json({success: false, message: `Variant "${item.selectedVariant}" is no longer available for ${item.name}`});
                    }
                    if (variant.stock < item.quantity) {
                        // Insufficient stock, cancel order
                        await orderModel.findByIdAndDelete(orderInfo.receipt);
                        return res.json({success: false, message: `Insufficient stock for ${item.name} (${item.selectedVariant}). Only ${variant.stock} available.`});
                    }
                    
                    // Deduct from variant stock
                    const variantIndex = product.variants.findIndex(v => {
                        if (item.selectedVariant.includes(':') && item.selectedVariant.includes('::')) {
                            const attributes = {}
                            const pairs = item.selectedVariant.split('::')
                            pairs.forEach(pair => {
                                const [type, value] = pair.split(':')
                                if (type && value) attributes[type] = value
                            })
                            for (const [type, value] of Object.entries(attributes)) {
                                const variantValue = type === 'color' ? (v.color || v.attributes?.color) : v.attributes?.[type]
                                if (variantValue !== value) return false
                            }
                            return true
                        }
                        return v.color === item.selectedVariant
                    });
                    if (variantIndex >= 0) {
                        await productModel.findByIdAndUpdate(
                            item._id,
                            { $inc: { [`variants.${variantIndex}.stock`]: -item.quantity } },
                            { new: true }
                        );
                    }
                } else {
                    // Non-variant product
                    if (product.stock < item.quantity) {
                        // Insufficient stock, cancel order
                        await orderModel.findByIdAndDelete(orderInfo.receipt);
                        return res.json({success: false, message: `Insufficient stock for ${item.name}. Only ${product.stock} available.`});
                    }
                    
                    // Deduct stock
                    await productModel.findByIdAndUpdate(
                        item._id,
                        { $inc: { stock: -item.quantity } },
                        { new: true }
                    );
                }
            }

            // Mark payment as successful and clear cart
            await orderModel.findByIdAndUpdate(orderInfo.receipt,{payment:true});
            await userModel.findByIdAndUpdate(userId,{cartData:{}})

            // Send confirmation email (fire-and-forget)
            const paidOrder = await orderModel.findById(orderInfo.receipt)
            const paidUser  = await userModel.findById(userId).select('name email')
            if (paidOrder && paidUser) {
                sendOrderConfirmationEmail(paidOrder, paidUser.email, paidUser.name)
                sendAdminNewOrderEmail(paidOrder, paidUser.name, paidUser.email)
            }

            res.json({ success: true, message: "Payment Successful" })
        } else {
            // Payment failed - no stock deduction needed since it wasn't deducted yet
            res.json({ success: false, message: 'Payment Failed' });
        }

    } catch (error) {
        console.error('Error verifying Razorpay payment:', error)
        res.json({success:false,message:error.message})
    }
}


// All Orders data for Admin Panel
const allOrders = async (req,res) => {

    try {
        
        const orders = await orderModel.find({})
        res.json({success:true,orders})

    } catch (error) {
        console.error('Error fetching all orders:', error)
        res.json({success:false,message:error.message})
    }

}

// User Order Data For Forntend
const userOrders = async (req,res) => {
    try {
        
        const { userId } = req.body

        const orders = await orderModel.find({ userId })
        res.json({success:true,orders})

    } catch (error) {
        console.error('Error fetching user orders:', error)
        res.json({success:false,message:error.message})
    }
}

// update order status from Admin Panel
const updateStatus = async (req,res) => {
    try {
        
        const { orderId, status, trackingNumber } = req.body

        const existingOrder = await orderModel.findById(orderId).select('status')
        if (!existingOrder) return res.json({ success: false, message: 'Order not found' })

        const statusChanged = existingOrder.status !== status

        // Build $set fields
        const setFields = { status }
        if (trackingNumber !== undefined) setFields.trackingNumber = trackingNumber

        const updateOp = { $set: setFields }
        // Only append to history when status actually changes (not a tracking-only save)
        if (statusChanged) {
            updateOp.$push = { statusHistory: { status, timestamp: new Date() } }
        }

        await orderModel.findByIdAndUpdate(orderId, updateOp)

        // Notify customer by email only on actual status change (fire-and-forget)
        if (statusChanged) {
            const updatedOrder = await orderModel.findById(orderId)
            if (updatedOrder) {
                const customer = await userModel.findById(updatedOrder.userId).select('name email')
                if (customer) {
                    sendOrderStatusEmail(updatedOrder, customer.email, customer.name, status, trackingNumber)
                }
            }
        }

        res.json({success:true,message:'Status Updated'})

    } catch (error) {
        console.error('Error updating order status:', error)
        res.json({success:false,message:error.message})
    }
}

// Delete an order (admin only)
const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.body
        await orderModel.findByIdAndDelete(orderId)
        res.json({ success: true, message: 'Order deleted' })
    } catch (error) {
        console.error('Error deleting order:', error)
        res.json({ success: false, message: error.message })
    }
}

// Cancel an order (user only, within 24 hours, only if status is 'New')
const cancelOrder = async (req, res) => {
    try {
        const { userId, orderId } = req.body

        const order = await orderModel.findById(orderId)

        if (!order) {
            return res.json({ success: false, message: 'Order not found' })
        }

        if (order.userId.toString() !== userId.toString()) {
            return res.json({ success: false, message: 'Unauthorized: this order does not belong to you' })
        }

        // 24-hour cancellation window
        const hoursSincePlaced = (Date.now() - order.date) / (1000 * 60 * 60)
        if (hoursSincePlaced > 24) {
            return res.json({ success: false, message: 'Orders can only be cancelled within 24 hours of placing' })
        }

        if (order.status !== 'New') {
            return res.json({ success: false, message: 'Only new orders that have not been shipped can be cancelled' })
        }

        // Restore stock for each item
        for (const item of order.items) {
            await productModel.findByIdAndUpdate(
                item._id,
                { $inc: { stock: item.quantity } }
            )
        }

        await orderModel.findByIdAndUpdate(orderId, {
            status: 'Cancelled',
            $push: { statusHistory: { status: 'Cancelled', timestamp: new Date() } }
        })

        // Notify customer (fire-and-forget)
        const cancelledOrder = await orderModel.findById(orderId)
        const cancelledUser  = await userModel.findById(userId).select('name email')
        if (cancelledOrder && cancelledUser) {
            sendOrderStatusEmail(cancelledOrder, cancelledUser.email, cancelledUser.name, 'Cancelled')
        }

        res.json({ success: true, message: 'Order cancelled successfully' })

    } catch (error) {
        console.error('Error cancelling order:', error)
        res.json({ success: false, message: error.message })
    }
}

export { verifyRazorpay, placeOrder, placeOrderRazorpay, allOrders, userOrders, updateStatus, deleteOrder, cancelOrder }