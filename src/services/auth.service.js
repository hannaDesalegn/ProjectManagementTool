import prisma from "../config/prisma.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import { log } from "../utils/logger.js";
import { sendEmail } from "../utils/email.js";
import crypto from "crypto";



// Register
export const register = async ({ email, password, name }) => {
  if (!email || !password || !name) {
    throw new Error("Email, password, and name are required");
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error("User already exists");

  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: { email, password_hash: hashed, name },
  });

  return { id: user.id, email: user.email, name: user.name };
};

// Login
export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    log(`Failed login attempt: email not found (${email})`);
    throw new Error("Invalid credentials");
  }

  const match = await comparePassword(password, user.password_hash);
  if (!match) {
    log(`Failed login attempt: wrong password for email (${email})`);
    throw new Error("Invalid credentials");
  }

  const token = generateToken({ id: user.id, email: user.email });
  return { token };
};

// Request email verification
export const requestVerification = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");
  if (user.isVerified) throw new Error("User already verified");

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.user.update({
    where: { email },
    data: { verificationToken: token },
  });

  const verifyUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: "Verify your email",
    text: `Click to verify: ${verifyUrl}`,
    html: `<a href="${verifyUrl}">Verify Email</a>`,
  });
};

// Verify email
export const verifyEmail = async (token) => {
  const user = await prisma.user.findFirst({ where: { verificationToken: token } });
  if (!user) throw new Error("Invalid or expired verification token");

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, verificationToken: null },
  });
};

// Request password reset
export const requestPasswordReset = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.user.update({
    where: { email },
    data: { passwordResetToken: token, passwordResetExpires: expires },
  });

  const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: "Password Reset",
    text: `Click to reset: ${resetUrl}`,
    html: `<a href="${resetUrl}">Reset Password</a>`,
  });
};

// Reset password
export const resetPassword = async (token, newPassword) => {
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { gt: new Date() },
    },
  });
  if (!user) throw new Error("Invalid or expired password reset token");

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password_hash: hashed,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });
};
