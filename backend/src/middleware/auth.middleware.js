const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { query } = require('../config/db');
const { unauthorized } = require('../utils/apiResponse');

/**
 * Verifies JWT from Authorization header.
 * Attaches req.user = { id, role_id, role_name, email, first_name, last_name }
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Fetch user with role name
    const result = await query(
      `SELECT u.id, u.role_id, r.name AS role_name, u.email, u.first_name, u.last_name, u.status
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return unauthorized(res, 'User not found');
    }

    const user = result.rows[0];

    if (user.status !== 'Active') {
      return unauthorized(res, 'Account is deactivated');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token expired');
    }
    if (err.name === 'JsonWebTokenError') {
      return unauthorized(res, 'Invalid token');
    }
    next(err);
  }
};

module.exports = authenticate;
