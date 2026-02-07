// Rate limiting middleware for authentication endpoints
const rateLimitStore = new Map();

export const createRateLimiter = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes
        max = 5, // limit each IP to 5 requests per windowMs
        message = 'Too many requests, please try again later.',
        skipSuccessfulRequests = false
    } = options;

    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        // Clean old entries
        for (const [ip, data] of rateLimitStore.entries()) {
            if (now - data.resetTime > windowMs) {
                rateLimitStore.delete(ip);
            }
        }

        // Get or create rate limit data for this IP
        let rateLimitData = rateLimitStore.get(key);
        if (!rateLimitData) {
            rateLimitData = {
                count: 0,
                resetTime: now
            };
            rateLimitStore.set(key, rateLimitData);
        }

        // Reset count if window has passed
        if (now - rateLimitData.resetTime > windowMs) {
            rateLimitData.count = 0;
            rateLimitData.resetTime = now;
        }

        // Check if limit exceeded
        if (rateLimitData.count >= max) {
            return res.status(429).json({
                error: message,
                retryAfter: Math.ceil((windowMs - (now - rateLimitData.resetTime)) / 1000)
            });
        }

        // Increment count
        rateLimitData.count++;

        // Add rate limit headers
        res.set({
            'X-RateLimit-Limit': max,
            'X-RateLimit-Remaining': Math.max(0, max - rateLimitData.count),
            'X-RateLimit-Reset': new Date(rateLimitData.resetTime + windowMs).toISOString()
        });

        next();
    };
};

// Specific rate limiters for different endpoints
export const authRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later.'
});

export const registerRateLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour
    message: 'Too many registration attempts, please try again later.'
});

export const passwordResetRateLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 password reset attempts per hour
    message: 'Too many password reset attempts, please try again later.'
});

export default {
    createRateLimiter,
    authRateLimiter,
    registerRateLimiter,
    passwordResetRateLimiter
};