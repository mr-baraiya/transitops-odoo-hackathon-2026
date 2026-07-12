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

  /**
   * Sign a password reset JWT token (expires in 15 mins)
   * The secret is salted with the user's password_hash to make the token single-use
   * @param {object} user - { id, email, password_hash }
   * @returns {string}
   */
  signResetToken: (user) => {
    const payload = { id: user.id, email: user.email };
    const secret = env.JWT_SECRET + user.password_hash;
    return jwt.sign(payload, secret, { expiresIn: '15m' });
  },

  /**
   * Verify a password reset JWT token
   * @param {string} token
   * @param {string} passwordHash - user's current password hash
   * @returns {object}
   */
  verifyResetToken: (token, passwordHash) => {
    const secret = env.JWT_SECRET + passwordHash;
    return jwt.verify(token, secret);
  },
};

module.exports = AuthService;
