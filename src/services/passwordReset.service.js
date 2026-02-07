import prisma from "../config/prisma.js";
import { generateToken, verifyToken } from "../config/jwt.js";
import { hashPassword } from "../utils/hash.js";

// Request password reset
export const requestPasswordReset = async (email) => {
    if (!email) {
        throw new Error("Email is required");
    }

    // Check if user exists
    const user = await prisma.users.findUnique({
        where: { email }
    });

    if (!user) {
        // Don't reveal if user exists or not for security
        return {
            message: "If an account with that email exists, a password reset link has been sent."
        };
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = generateToken({
        userId: user.id,
        email: user.email,
        type: 'password_reset'
    }, '1h');

    // In a real application, you would:
    // 1. Store the reset token in database with expiration
    // 2. Send email with reset link
    // For now, we'll just return the token

    return {
        message: "Password reset link has been sent to your email.",
        resetToken, // In production, don't return this
        resetLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
    };
};

// Verify reset token
export const verifyResetToken = async (token) => {
    try {
        const decoded = verifyToken(token);
        
        if (decoded.type !== 'password_reset') {
            throw new Error("Invalid reset token");
        }

        // Check if user still exists
        const user = await prisma.users.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            throw new Error("User not found");
        }

        return {
            valid: true,
            userId: decoded.userId,
            email: decoded.email
        };
    } catch (error) {
        return {
            valid: false,
            error: error.message
        };
    }
};

// Reset password with token
export const resetPassword = async ({ token, newPassword }) => {
    if (!token || !newPassword) {
        throw new Error("Token and new password are required");
    }

    if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long");
    }

    // Verify token
    const tokenVerification = await verifyResetToken(token);
    if (!tokenVerification.valid) {
        throw new Error("Invalid or expired reset token");
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    const updatedUser = await prisma.users.update({
        where: { id: tokenVerification.userId },
        data: { 
            password_hash: hashedPassword
        },
        select: {
            id: true,
            email: true,
            name: true
        }
    });

    return {
        message: "Password has been reset successfully",
        user: updatedUser
    };
};

// Change password (for authenticated users)
export const changePassword = async ({ userId, currentPassword, newPassword }) => {
    if (!currentPassword || !newPassword) {
        throw new Error("Current password and new password are required");
    }

    if (newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters long");
    }

    // Get user with current password
    const user = await prisma.users.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Verify current password
    const { comparePassword } = await import("../utils/hash.js");
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password_hash);
    
    if (!isCurrentPasswordValid) {
        throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: { 
            password_hash: hashedNewPassword
        },
        select: {
            id: true,
            email: true,
            name: true
        }
    });

    return {
        message: "Password changed successfully",
        user: updatedUser
    };
};

export default {
    requestPasswordReset,
    verifyResetToken,
    resetPassword,
    changePassword
};