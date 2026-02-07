import express from "express";
import cors from "cors";
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
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(express.json());

// health check
app.get("/", (req, res) => {
  res.send("HayTask is running");
});

// auth routes
app.use("/api/auth", authRoutes);

// protected route
app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "You accessed a protected route",
    user: req.user,
  });
});

app.use(errorHandler);

export default app;
