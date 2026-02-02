// console.log("TaskFlow backend starting...");
// require("dotenv").config();
// const jwt = require("jsonwebtoken");

// const payload = {
//     userId: "123",
//     email: "yo@test.com",
// };

// const token = jwt.sign(payload, process.env.JWT_SECRET, {
//     expiresIn: "1d",
// });

// console.log("JWT:", token);
// Temporary JWT test - will be replaced by auth module later

require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json()); // to parse JSON bodies

const PORT = process.env.PORT || 3000;

// Simple login endpoint (mock)
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    // Very simple "check" - in real app use DB & hashed passwords
    if (email === "yo@test.com" && password === "password123") {
        const payload = { userId: "123", email };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        return res.json({ token });
    }

    return res.status(401).json({ error: "Invalid credentials" });
});

// Protected route example
app.get("/profile", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token" });

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ message: "Welcome!", user: decoded });
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
});

app.listen(PORT, () => {
    console.log(`TaskFlow backend running on port ${PORT}`);
});