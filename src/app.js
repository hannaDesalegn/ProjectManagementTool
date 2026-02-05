require("dotenv").config();
const express = require("express");

const authController = require("./controllers/auth.controller");
const { protect } = require("./middleware/auth.middleware");

const app = express();

app.use(express.json());

// health check
app.get("/", (req, res) => {
    res.send("TaskFlow API is running 🚀");
});

// auth routes
app.post("/api/auth/register", authController.register);
app.post("/api/auth/login", authController.login);

// protected test route
app.get("/api/protected", protect, (req, res) => {
    res.json({
        message: "You accessed a protected route",
        user: req.user,
    });
});

module.exports = app;