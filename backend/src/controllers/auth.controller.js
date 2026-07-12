const UsersModel = require('../models/users.model');
const AuthService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { success, created, badRequest, unauthorized, notFound } = require('../utils/apiResponse');

/**
 * POST /api/auth/register
 */
exports.register = asyncHandler(async (req, res) => {
  const { role_id, first_name, last_name, email, password, phone } = req.body;

  // Check if email already exists
  const existing = await UsersModel.findByEmail(email);
  if (existing.rows.length > 0) {
    return badRequest(res, 'Email already registered');
  }

  const password_hash = await AuthService.hashPassword(password);
  const result = await UsersModel.create({ role_id, first_name, last_name, email, password_hash, phone });

  const user = result.rows[0];
  delete user.password_hash;

  return created(res, user, 'User registered successfully');
});

/**
 * POST /api/auth/login
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await UsersModel.findByEmail(email);
  if (result.rows.length === 0) {
    return unauthorized(res, 'Invalid email or password');
  }

  const user = result.rows[0];

  if (user.status !== 'Active') {
    return unauthorized(res, 'Account is deactivated');
  }

  const isMatch = await AuthService.comparePassword(password, user.password_hash);
  if (!isMatch) {
    return unauthorized(res, 'Invalid email or password');
  }

  await UsersModel.updateLastLogin(user.id);

  const token = AuthService.signToken({
    id: user.id,
    role_id: user.role_id,
    role_name: user.role_name,
    email: user.email,
  });

  delete user.password_hash;

  return success(res, { token, user }, 'Login successful');
});

/**
 * POST /api/auth/logout
 */
exports.logout = asyncHandler(async (req, res) => {
  // With stateless JWT, logout is client-side (discard token)
  // For a blacklist approach, you'd store the token here
  return success(res, null, 'Logged out successfully');
});

/**
 * GET /api/auth/me
 */
exports.me = asyncHandler(async (req, res) => {
  const result = await UsersModel.findById(req.user.id);
  if (result.rows.length === 0) {
    return notFound(res, 'User not found');
  }

  const user = result.rows[0];
  delete user.password_hash;

  return success(res, user);
});

const { sendMail } = require('../config/mailer');
const env = require('../config/env');
const jwt = require('jsonwebtoken');

/**
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await UsersModel.findByEmail(email);
  if (result.rows.length === 0) {
    // Return success to prevent email enumeration attacks
    return success(res, null, 'If the email is registered, a password reset link has been sent');
  }

  const user = result.rows[0];
  
  // Sign a secure one-time reset token
  const token = AuthService.signResetToken(user);
  const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  const subject = 'TransitOps — Password Reset Request';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #6366f1;">Reset Your Password</h2>
      <p>Hello ${user.first_name},</p>
      <p>We received a request to reset your password for your TransitOps account. Please click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p>This link is valid for <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999;">TransitOps Fleet System &copy; 2026</p>
    </div>
  `;

  await sendMail(email, subject, html);

  return success(res, null, 'If the email is registered, a password reset link has been sent');
});

/**
 * POST /api/auth/reset-password
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token) {
    return badRequest(res, 'Token is required');
  }

  // Decode first to check user ID without verifying yet
  let decoded;
  try {
    decoded = jwt.decode(token);
  } catch (err) {
    return badRequest(res, 'Invalid reset token format');
  }

  if (!decoded || !decoded.id) {
    return badRequest(res, 'Invalid reset token payload');
  }

  // Retrieve user to fetch current password hash
  const result = await UsersModel.findById(decoded.id);
  if (result.rows.length === 0) {
    return badRequest(res, 'User associated with token not found');
  }

  const user = result.rows[0];

  // Verify token using user's current password hash as the secret
  try {
    AuthService.verifyResetToken(token, user.password_hash);
  } catch (err) {
    return badRequest(res, 'Reset token is invalid or has expired');
  }

  // Hash new password and save it
  const newHash = await AuthService.hashPassword(password);
  await UsersModel.update(user.id, { password_hash: newHash });

  return success(res, null, 'Password reset successfully');
});
