/**
 * Simple rate limiting middleware for payment endpoints
 * Prevents brute force and abuse
 */

const paymentAttempts = new Map() // Map to store attempts: userId -> { count, resetTime }
const MAX_ATTEMPTS = 5 // Max 5 payment attempts per window
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes

export const paymentRateLimit = (req, res, next) => {
    try {
        const userId = req.body.userId || req.user?.id
        
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID required' })
        }

        const now = Date.now()
        const userAttempts = paymentAttempts.get(userId)

        // First attempt or window expired
        if (!userAttempts || now > userAttempts.resetTime) {
            paymentAttempts.set(userId, {
                count: 1,
                resetTime: now + RATE_LIMIT_WINDOW,
                ips: [req.ip]
            })
            return next()
        }

        // Check if limit exceeded
        if (userAttempts.count >= MAX_ATTEMPTS) {
            // Check if window should reset
            if (now < userAttempts.resetTime) {
                const secondsLeft = Math.ceil((userAttempts.resetTime - now) / 1000)
                return res.status(429).json({
                    success: false,
                    message: `Too many payment attempts. Try again in ${secondsLeft} seconds`,
                    retryAfter: secondsLeft
                })
            }
        }

        // Increment attempt counter
        userAttempts.count++
        userAttempts.ips.push(req.ip)
        paymentAttempts.set(userId, userAttempts)

        next()
    } catch (error) {
        next() // Don't block on error
    }
}

/**
 * Cleanup old entries from memory every 30 minutes
 */
setInterval(() => {
    const now = Date.now()
    for (const [userId, attempts] of paymentAttempts.entries()) {
        if (now > attempts.resetTime) {
            paymentAttempts.delete(userId)
        }
    }
}, 30 * 60 * 1000)
