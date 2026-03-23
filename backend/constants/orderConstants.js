/**
 * Centralized constants for order and cart operations
 * Prevents hardcoding and makes maintenance easier
 */

export const ORDER_CONSTANTS = {
    // Payment configuration
    CURRENCY: 'inr',
    DELIVERY_CHARGE: 10,
    
    // Quantity limits
    MAX_ITEM_QUANTITY: 999,
    MIN_ITEM_QUANTITY: 1,
    
    // Wholesale configuration
    MIN_WHOLESALE_QUANTITY: 10,
    
    // Cart limits
    MAX_RECENTLY_VIEWED: 20,
    
    // Order status flow
    ORDER_STATUSES: {
        NEW: 'New',
        CONFIRMED: 'Confirmed',
        SHIPPED: 'Shipped',
        DELIVERED: 'Delivered',
        CANCELLED: 'Cancelled'
    },
    
    // Valid status transitions
    VALID_TRANSITIONS: {
        'New': ['Confirmed', 'Cancelled'],
        'Confirmed': ['Shipped', 'Cancelled'],
        'Shipped': ['Delivered'],
        'Delivered': [],
        'Cancelled': []
    },
    
    // Payment methods
    PAYMENT_METHODS: {
        COD: 'COD',
        RAZORPAY: 'Razorpay'
    }
};

export const PAYMENT_CONSTANTS = {
    // Razorpay configuration
    RAZORPAY_CURRENCY: 'INR',
    
    // Amount representation (Razorpay uses paise, 1 rupee = 100 paise)
    PAISE_PER_RUPEE: 100,
    
    // Payment status
    PAYMENT_STATUSES: {
        CREATED: 'created',
        CAPTURED: 'captured',
        FAILED: 'failed',
        AUTHORIZED: 'authorized'
    },
    
    // Order status from Razorpay
    RAZORPAY_ORDER_STATUS: {
        CREATED: 'created',
        PAID: 'paid',
        ATTEMPTED: 'attempted',
        EXPIRED: 'expired'
    }
};

export default {
    ORDER_CONSTANTS,
    PAYMENT_CONSTANTS
};
