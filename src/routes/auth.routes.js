// src/routes/auth.routes.js
import express from "express";
import { body } from "express-validator";
import {
    register,
    login,
    verifyToken,
    requestVerification,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Register route
router.post(
    "/register", [
        body("email").isEmail().withMessage("Valid email required"),
        body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters")
        .matches(/^(?=.*[A-Z])(?=.*\d).{6,}$/)
        .withMessage("Password must include an uppercase letter and a number"),
        body("name").notEmpty().withMessage("Name is required"),
        body("phone").optional().isMobilePhone().withMessage("Phone must be valid"),
        body("termsAccepted")
        .isBoolean()
        .equals("true")
        .withMessage("Terms must be accepted"),
    ],
    register
);

// Login route
router.post(
    "/login", [
        body("email").isEmail().withMessage("Valid email required"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    login
);

// Verify token route
router.get("/verify", protect, verifyToken);

// Get user by email (protected route for invitations)
router.get("/user-by-email", protect, async(req, res) => {
    try {
        const { email } = req.query;

        console.log('Looking up user by email:', email);

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const { default: prisma } = await
        import ('../config/prisma.js');

        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                profile_pic: true
            }
        });

        console.log('User lookup result:', user);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ user });
    } catch (error) {
        console.error('Error finding user:', error);
        res.status(500).json({ error: "Failed to find user" });
    }
});

// Email verification
router.post("/request-verification", [body("email").isEmail()], requestVerification);
router.get("/verify-email", verifyEmail);

// Password reset
router.post("/request-password-reset", [body("email").isEmail()], requestPasswordReset);
router.post(
    "/reset-password", [
        body("token").notEmpty().withMessage("Token is required"),
        body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters")
        .matches(/^(?=.*[A-Z])(?=.*\d).{6,}$/)
        .withMessage("Password must include an uppercase letter and a number"),
    ],
    resetPassword
);

export default router;