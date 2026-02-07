import express from "express";
import {
  register,
  login,
  requestVerification,
  verifyEmail,
  requestPasswordReset,
  resetPassword
} from "./controllers/auth.controller.js"; 

import { protect } from "./middleware/auth.middleware.js";
import errorHandler from "./middleware/error.middleware.js";
import { securityHeaders, corsMiddleware, enforceHTTPS } from "./middleware/security.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import projectRoutes from "./routes/project.routes.js";
import boardRoutes from "./routes/board.routes.js";

const app = express();

// Security middleware (apply first)
app.use(enforceHTTPS);
app.use(securityHeaders);
app.use(corsMiddleware);

app.use(express.json({ limit: '10mb' }));

// health check
app.get("/", (req, res) => {
  res.send("TaskFlow API is running 🚀");
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
