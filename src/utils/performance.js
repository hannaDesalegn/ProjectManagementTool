import logger from './logger.js';

// Performance monitoring middleware
export const performanceMonitor = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;

        if (duration > 1000) {
            logger.warn('Slow request detected', {
                method: req.method,
                path: req.path,
                duration: `${duration}ms`,
                statusCode: res.statusCode
            });
        }

        logger.info('Request completed', {
            method: req.method,
            path: req.path,
            duration: `${duration}ms`,
            statusCode: res.statusCode
        });
    });

    next();
};

// Database query performance tracker
export class QueryPerformanceTracker {
    constructor() {
        this.queries = [];
        this.slowQueryThreshold = 100; // ms
    }

    track(queryName, duration) {
        this.queries.push({
            name: queryName,
            duration,
            timestamp: new Date()
        });

        if (duration > this.slowQueryThreshold) {
            logger.warn('Slow query detected', {
                query: queryName,
                duration: `${duration}ms`
            });
        }
    }

    getStats() {
        if (this.queries.length === 0) {
            return { count: 0, avgDuration: 0, slowQueries: 0 };
        }

        const total = this.queries.reduce((sum, q) => sum + q.duration, 0);
        const slowQueries = this.queries.filter(q => q.duration > this.slowQueryThreshold).length;

        return {
            count: this.queries.length,
            avgDuration: (total / this.queries.length).toFixed(2),
            slowQueries,
            totalDuration: total
        };
    }

    reset() {
        this.queries = [];
    }
}

export const queryTracker = new QueryPerformanceTracker();

// Measure async function execution time
export const measureTime = async(fn, label) => {
    const start = Date.now();
    try {
        const result = await fn();
        const duration = Date.now() - start;
        queryTracker.track(label, duration);
        return result;
    } catch (error) {
        const duration = Date.now() - start;
        logger.error(`${label} failed after ${duration}ms`, error);
        throw error;
    }
};

export default {
    performanceMonitor,
    QueryPerformanceTracker,
    queryTracker,
    measureTime
};