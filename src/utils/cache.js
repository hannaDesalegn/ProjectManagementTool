// Simple in-memory cache with TTL support
class Cache {
    constructor() {
        this.store = new Map();
        this.timers = new Map();
    }

    set(key, value, ttl = 3600000) {
        // Clear existing timer if any
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
        }

        this.store.set(key, value);

        // Set expiration timer
        const timer = setTimeout(() => {
            this.delete(key);
        }, ttl);

        this.timers.set(key, timer);
    }

    get(key) {
        return this.store.get(key);
    }

    has(key) {
        return this.store.has(key);
    }

    delete(key) {
        this.store.delete(key);
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
            this.timers.delete(key);
        }
    }

    clear() {
        this.timers.forEach(timer => clearTimeout(timer));
        this.store.clear();
        this.timers.clear();
    }

    size() {
        return this.store.size;
    }
}

// Global cache instance
const cache = new Cache();

// Cache middleware for API responses
export const cacheMiddleware = (duration = 300000) => {
    return (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        const key = `cache:${req.originalUrl || req.url}:${req.user?.id || 'anonymous'}`;
        const cached = cache.get(key);

        if (cached) {
            return res.json(cached);
        }

        const originalJson = res.json.bind(res);
        res.json = (data) => {
            cache.set(key, data, duration);
            return originalJson(data);
        };

        next();
    };
};

// Invalidate cache by pattern
export const invalidateCache = (pattern) => {
    const keys = Array.from(cache.store.keys());
    keys.forEach(key => {
        if (key.includes(pattern)) {
            cache.delete(key);
        }
    });
};

export default cache;