// src/controllers/auth.controller.js
import { validationResult } from "express-validator";
import * as authService from "../services/auth.service.js";

// REGISTER
export const register = async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ success: false, errors: errors.array() });

    try {
        console.log('Registration attempt:', req.body);
        const user = await authService.register(req.body);
        console.log('Registration successful:', user);
        res.status(201).json({ success: true, user });
    } catch (err) {
        console.error('Registration error:', err);
        next(err);
    }
};

// LOGIN
export const login = async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ success: false, errors: errors.array() });

    try {
        console.log('Login attempt:', req.body);
        const result = await authService.login(req.body);
        console.log('Login successful:', result);
        res.status(200).json({ success: true, ...result });
    } catch (err) {
        console.error('Login error:', err);
        next(err);
    }
};

// VERIFY TOKEN
export const verifyToken = async(req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: "Token is valid",
            user: req.user
        });
    } catch (err) {
        next(err);
    }
};

// REQUEST VERIFICATION
export const requestVerification = async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ success: false, errors: errors.array() });

    try {
        await authService.requestVerification(req.body.email);
        res.status(200).json({ success: true, message: "Verification email sent" });
    } catch (err) {
        next(err);
    }
};

// VERIFY EMAIL
export const verifyEmail = async(req, res, next) => {
    try {
        await authService.verifyEmail(req.query.token);
        res.status(200).json({ success: true, message: "Email verified" });
    } catch (err) {
        next(err);
    }
};

// REQUEST PASSWORD RESET
export const requestPasswordReset = async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ success: false, errors: errors.array() });

    try {
        await authService.requestPasswordReset(req.body.email);
        res.status(200).json({ success: true, message: "Password reset email sent" });
    } catch (err) {
        next(err);
    }
};

// RESET PASSWORD
export const resetPassword = async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ success: false, errors: errors.array() });

    try {
        await authService.resetPassword(req.body.token, req.body.password);
        res.status(200).json({ success: true, message: "Password has been reset" });
    } catch (err) {
        next(err);
    }
};