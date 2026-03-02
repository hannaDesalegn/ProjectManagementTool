import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import { protect } from "./middleware/auth.middleware.js";
import errorHandler from "./middleware/error.middleware.js";
import { securityHeaders, corsMiddleware, enforceHTTPS } from "./middleware/security.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import projectRoutes from "./routes/project.routes.js";
import boardRoutes from "./routes/board.routes.js";

const app = express();

// Get current directory for ES modules
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

// Security middleware (apply first)
app.use(enforceHTTPS);
app.use(securityHeaders);
app.use(corsMiddleware);

app.use(express.json({ limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));

// health check
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/boards", boardRoutes);

// protected route
app.get("/api/protected", protect, (req, res) => {
    res.json({
        message: "You accessed a protected route",
        user: req.user,
    });
});

app.use(errorHandler);

export default app;