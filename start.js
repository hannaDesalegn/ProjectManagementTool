#!/usr/bin/env node

// HayTask Startup Script
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting HayTask Project Management System...\n');

// Start the server
console.log('📡 Starting backend server...');
const server = spawn('npm', ['run', 'start'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
});

server.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});

server.on('close', (code) => {
    console.log(`\n📡 Server process exited with code ${code}`);
    process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down HayTask...');
    server.kill('SIGINT');
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down HayTask...');
    server.kill('SIGTERM');
});

console.log('✅ HayTask is starting up!');
console.log('🌐 Frontend will be available at: http://localhost:3001');
console.log('🔌 WebSocket available at: ws://localhost:3001/ws');
console.log('📖 API Documentation: Check API_DOCS.md');
console.log('\n💡 Press Ctrl+C to stop the server\n');