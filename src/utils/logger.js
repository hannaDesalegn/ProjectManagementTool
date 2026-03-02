// utils/logger.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const logFile = path.join(__dirname, "../../logs/app.log");

function writeLog(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    const entry = `[${timestamp}] [${level}] ${message}${metaStr}\n`;

    // Ensure logs directory exists
    const logsDir = path.dirname(logFile);
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }

    fs.appendFileSync(logFile, entry, { encoding: "utf8" });
}

export const logger = {
    info: (message, meta) => writeLog('INFO', message, meta),
    warn: (message, meta) => writeLog('WARN', message, meta),
    error: (message, meta) => writeLog('ERROR', message, meta),
    debug: (message, meta) => writeLog('DEBUG', message, meta),
    log: (message) => writeLog('LOG', message)
};

export const log = logger.log;