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
