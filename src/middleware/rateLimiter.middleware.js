import logger from '../utils/logger.js';

// In-memory store (fallback)
const rateLimitStore = new Map();

// Redis client (optional)
let redisClient = null;

export const initRedis = (client) => {
    redisClient = client;
    logger.info('Rate limiter configured with Redis');
};

// Trusted IPs
const trustedIPs = new Set([
    '127.0.0.1',
    '::1'
]);

// Get client identifier
const getClientKey = (req, useUserId = false) => {
    if (useUserId && req.user && req.user.id) {
        return `user:${req.user.id}`;
    }

    return `ip:${req.ip || (req.connection && req.connection.remoteAddress)}`;
};

// Store operations
const storeOperations = {
    async asyncget(key) {
        if (redisClient) {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        }
        return rateLimitStore.get(key) || null;
    },

    asyncset(key, value, ttl) {
        if (redisClient) {
            return redisClient.setEx(
                key,
                Math.ceil(ttl / 1000),
                JSON.stringify(value)
            );
        }

        rateLimitStore.set(key, value);
    },

    async delete(key) {
        if (redisClient) {
            return redisClient.del(key);
        }

        rateLimitStore.delete(key);
    }
};

// Cleanup (memory only)
const cleanupStore = (windowMs) => {
    if (redisClient) return;

    const now = Date.now();

    for (const [key, data] of rateLimitStore.entries()) {
        if (now - data.resetTime >= windowMs) {
            rateLimitStore.delete(key);
        }
    }
};

export const createRateLimiter = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000,
            max = 5,
            message = 'Too many requests, please try again later.',
            skipSuccessfulRequests = false,
            skipFailedRequests = false,
            useUserId = false,
            keyGenerator = null,
            handler = null,
            skip = null,
            onLimitReached = null
    } = options;

    return async(req, res, next) => {
        try {
            const clientIP = req.ip || (req.connection && req.connection.remoteAddress);

            if (trustedIPs.has(clientIP)) return next();
            if (skip && skip(req)) return next();

            const key = keyGenerator ?
                keyGenerator(req) :
                getClientKey(req, useUserId);

            const now = Date.now();
            cleanupStore(windowMs);

            let rateLimitData = await storeOperations.get(key);

            if (!rateLimitData) {
                rateLimitData = {
                    count: 0,
                    resetTime: now
                };
            }

            // Reset window if expired
            if (now - rateLimitData.resetTime >= windowMs) {
                rateLimitData.count = 0;
                rateLimitData.resetTime = now;
            }

            // Check limit
            if (rateLimitData.count >= max) {
                const retryAfter = Math.ceil(
                    (windowMs - (now - rateLimitData.resetTime)) / 1000
                );

                logger.warn(`Rate limit exceeded for ${key}`, {
                    ip: clientIP,
                    path: req.path,
                    method: req.method
                });

                if (onLimitReached) {
                    onLimitReached(req, res);
                }

                if (handler) {
                    return handler(req, res, next);
                }

                res.set({
                    'X-RateLimit-Limit': max,
                    'X-RateLimit-Remaining': 0,
                    'X-RateLimit-Reset': new Date(
                        rateLimitData.resetTime + windowMs
                    ).toISOString(),
                    'Retry-After': retryAfter
                });

                return res.status(429).json({
                    error: message,
                    retryAfter
                });
            }

            // Count after response finishes
            res.on('finish', async() => {
                const statusCode = res.statusCode;
                let shouldCount = true;

                if (skipSuccessfulRequests && statusCode < 400) {
                    shouldCount = false;
                }

                if (skipFailedRequests && statusCode >= 400) {
                    shouldCount = false;
                }

                if (shouldCount) {
                    rateLimitData.count++;

                    try {
                        await storeOperations.set(
                            key,
                            rateLimitData,
                            windowMs
                        );
                    } catch (err) {
                        logger.error(
                            'Failed to update rate limit data',
                            err
                        );
                    }
                }
            });

            res.set({
                'X-RateLimit-Limit': max,
                'X-RateLimit-Remaining': Math.max(
                    0,
                    max - rateLimitData.count
                ),
                'X-RateLimit-Reset': new Date(
                    rateLimitData.resetTime + windowMs
                ).toISOString()
            });

            next();
        } catch (error) {
            logger.error('Rate limiter error', error);
            next();
        }
    };
};

// Pre-configured limiters
export const authRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true,
    onLimitReached: (req) => {
        logger.warn('Auth rate limit reached', {
            ip: req.ip,
            email: req.body && req.body.email
        });
    }
});

export const registerRateLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Too many registration attempts, please try again later.'
});

export const passwordResetRateLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Too many password reset attempts, please try again later.'
});

export const emailVerificationRateLimiter = createRateLimiter({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: 'Too many verification requests, please try again later.'
});

export const apiRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many API requests, please slow down.',
    useUserId: true,
    skipFailedRequests: true
});

export const strictApiRateLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Rate limit exceeded for this operation.',
    useUserId: true
});

export const addTrustedIP = (ip) => {
    trustedIPs.add(ip);
    logger.info(`Added trusted IP: ${ip}`);
};

export const removeTrustedIP = (ip) => {
    trustedIPs.delete(ip);
    logger.info(`Removed trusted IP: ${ip}`);
};

export const getRateLimitInfo = async(key) => {
    return storeOperations.get(key);
};

export const resetRateLimit = async(key) => {
    await storeOperations.delete(key);
    logger.info(`Reset rate limit for: ${key}`);
};

export default {
    createRateLimiter,
    authRateLimiter,
    registerRateLimiter,
    passwordResetRateLimiter,
    emailVerificationRateLimiter,
    apiRateLimiter,
    strictApiRateLimiter,
    initRedis,
    addTrustedIP,
    removeTrustedIP,
    getRateLimitInfo,
    resetRateLimit
};