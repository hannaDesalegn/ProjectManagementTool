const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');

exports.register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};


exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const result = await authService.login(req.body);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

// Email verification
exports.requestVerification = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    await authService.requestVerification(req.body.email);
    res.status(200).json({ success: true, message: 'Verification email sent' });
  } catch (err) {
    next(err);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    await authService.verifyEmail(req.query.token);
    res.status(200).json({ success: true, message: 'Email verified' });
  } catch (err) {
    next(err);
  }
};

// Password reset
exports.requestPasswordReset = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    await authService.requestPasswordReset(req.body.email);
    res.status(200).json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    await authService.resetPassword(req.body.token, req.body.password);
    res.status(200).json({ success: true, message: 'Password has been reset' });
  } catch (err) {
    next(err);
  }
};