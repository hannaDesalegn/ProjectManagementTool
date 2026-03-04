// server.js
import dotenv from "dotenv";

// Load environment variables FIRST before any other imports
dotenv.config();

import http from "http";
import app from "./app.js";
import { initWebSocket } from "./websocket/server.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket
initWebSocket(server);

server.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
    logger.info(`🔌 WebSocket available at ws://localhost:${PORT}/ws`);
    logger.info(`🔐 JWT_SECRET loaded: ${process.env.JWT_SECRET ? 'YES' : 'NO'}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});