import "dotenv/config";
import express from "express";
import authController from "./controllers/auth.controller.js";
import { protect } from "./middleware/auth.middleware.js";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import projectRoutes from "./routes/project.routes.js";
import boardRoutes from "./routes/board.routes.js";

const app = express();

app.use(express.json());

// health check
app.get("/", (req, res) => {
    res.send("TaskFlow API is running 🚀");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/boards", boardRoutes);

// Legacy auth routes (keeping for backward compatibility)
app.post("/api/auth/register", authController.register);
app.post("/api/auth/login", authController.login);

// protected test route
app.get("/api/protected", protect, (req, res) => {
    res.json({
        message: "You accessed a protected route",
        user: req.user,
    });
});

export default app;