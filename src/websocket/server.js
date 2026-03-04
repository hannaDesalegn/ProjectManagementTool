import { WebSocketServer } from 'ws';
import { verifyToken } from '../utils/JWT.js';
import logger from '../utils/logger.js';

const clients = new Map();
const workspaceRooms = new Map();

export function initWebSocket(server) {
    const wss = new WebSocketServer({ server, path: '/ws' });

    wss.on('connection', async(ws, req) => {
        logger.info('WebSocket connection attempt');

        // Extract token from query string
        const url = new URL(req.url, `http://${req.headers.host}`);
        const token = url.searchParams.get('token');

        if (!token) {
            ws.close(1008, 'Authentication required');
            return;
        }

        try {
            const decoded = verifyToken(token);
            const userId = decoded.id;

            ws.userId = userId;
            ws.isAlive = true;

            clients.set(userId, ws);
            logger.info(`WebSocket authenticated for user ${userId}`);

            // Send welcome message
            ws.send(JSON.stringify({
                type: 'connected',
                message: 'WebSocket connection established',
                userId
            }));

            // Handle messages
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    handleMessage(ws, message);
                } catch (error) {
                    logger.error('WebSocket message error:', error);
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Invalid message format'
                    }));
                }
            });

            // Handle pong
            ws.on('pong', () => {
                ws.isAlive = true;
            });

            // Handle close
            ws.on('close', () => {
                clients.delete(userId);
                leaveAllRooms(userId);
                logger.info(`WebSocket disconnected for user ${userId}`);
            });

            // Handle errors
            ws.on('error', (error) => {
                logger.error('WebSocket error:', error);
            });

        } catch (error) {
            logger.error('WebSocket authentication failed:', error);
            ws.close(1008, 'Invalid token');
        }
    });

    // Heartbeat to detect broken connections
    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) {
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('close', () => {
        clearInterval(interval);
    });

    logger.info('WebSocket server initialized');
    return wss;
}

function handleMessage(ws, message) {
    const { type, data } = message;

    switch (type) {
        case 'join_workspace':
            joinWorkspace(ws.userId, data.workspaceId);
            ws.send(JSON.stringify({
                type: 'joined_workspace',
                workspaceId: data.workspaceId
            }));
            break;

        case 'leave_workspace':
            leaveWorkspace(ws.userId, data.workspaceId);
            ws.send(JSON.stringify({
                type: 'left_workspace',
                workspaceId: data.workspaceId
            }));
            break;

        case 'ping':
            ws.send(JSON.stringify({ type: 'pong' }));
            break;

        default:
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Unknown message type'
            }));
    }
}

function joinWorkspace(userId, workspaceId) {
    if (!workspaceRooms.has(workspaceId)) {
        workspaceRooms.set(workspaceId, new Set());
    }
    workspaceRooms.get(workspaceId).add(userId);
    logger.info(`User ${userId} joined workspace ${workspaceId}`);
}

function leaveWorkspace(userId, workspaceId) {
    if (workspaceRooms.has(workspaceId)) {
        workspaceRooms.get(workspaceId).delete(userId);
        if (workspaceRooms.get(workspaceId).size === 0) {
            workspaceRooms.delete(workspaceId);
        }
    }
    logger.info(`User ${userId} left workspace ${workspaceId}`);
}

function leaveAllRooms(userId) {
    workspaceRooms.forEach((users, workspaceId) => {
        if (users.has(userId)) {
            users.delete(userId);
            if (users.size === 0) {
                workspaceRooms.delete(workspaceId);
            }
        }
    });
}

// Broadcast to workspace
export function broadcastToWorkspace(workspaceId, message) {
    if (!workspaceRooms.has(workspaceId)) {
        return;
    }

    const users = workspaceRooms.get(workspaceId);
    const messageStr = JSON.stringify(message);

    users.forEach(userId => {
        const ws = clients.get(userId);
        if (ws && ws.readyState === 1) {
            ws.send(messageStr);
        }
    });
}

// Send to specific user
export function sendToUser(userId, message) {
    const ws = clients.get(userId);
    if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify(message));
    }
}

// Broadcast to all connected clients
export function broadcastToAll(message) {
    const messageStr = JSON.stringify(message);
    clients.forEach(ws => {
        if (ws.readyState === 1) {
            ws.send(messageStr);
        }
    });
}

export default {
    initWebSocket,
    broadcastToWorkspace,
    sendToUser,
    broadcastToAll
};