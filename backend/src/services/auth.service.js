const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const SALT_ROUNDS = 12;

const AuthService = {
  /**
   * Hash a plain-text password
   * @param {string} password
   * @returns {Promise<string>}
   */
  hashPassword: (password) => bcrypt.hash(password, SALT_ROUNDS),

  /**
   * Compare plain-text password with hash
   * @param {string} password
   * @param {string} hash
   * @returns {Promise<boolean>}
   */
  comparePassword: (password, hash) => bcrypt.compare(password, hash),

  /**
   * Sign a JWT token
   * @param {object} payload - { id, role_id, role_name, email }
   * @returns {string}
   */
  signToken: (payload) =>
    jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN }),

  /**
   * Verify a JWT token
   * @param {string} token
   * @returns {object}
   */
  verifyToken: (token) => jwt.verify(token, env.JWT_SECRET),
};

module.exports = AuthService;
