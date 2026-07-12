const { forbidden } = require('../utils/apiResponse');

/**
 * Role-Based Access Control middleware
 * @param  {...string} allowedRoles - Role names that can access the route
 * @returns {Function} Express middleware
 *
 * Usage: authorize('Admin', 'Fleet Manager')
 *
 * Role names (from DB):
 *   Admin, Fleet Manager, Driver, Safety Officer, Finance
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return forbidden(res, 'Authentication required');
    }

    if (!allowedRoles.includes(req.user.role_name)) {
      return forbidden(res, `Access denied. Required role: ${allowedRoles.join(' or ')}`);
    }

    next();
  };
};

module.exports = authorize;
