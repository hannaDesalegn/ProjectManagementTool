// src/routes/auth.routes.js
import express from "express";
import { body } from "express-validator";
import {
  register,
  login,
  requestVerification,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

// Register route
router.post(
  "/register",
  [
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
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

// Email verification
router.post("/request-verification", [body("email").isEmail()], requestVerification);
router.get("/verify-email", verifyEmail);

// Password reset
router.post("/request-password-reset", [body("email").isEmail()], requestPasswordReset);
router.post(
  "/reset-password",
  [
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
