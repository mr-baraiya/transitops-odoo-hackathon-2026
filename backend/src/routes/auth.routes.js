const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate');
const { authSchemas } = require('../middleware/schemas');

router.post('/register', authenticate, authorize('Admin', 'Fleet Manager'), validate(authSchemas.register, 'body'), authController.register);
router.post('/login', validate(authSchemas.login, 'body'), authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.post('/forgot-password', validate(authSchemas.forgotPassword, 'body'), authController.forgotPassword);
router.post('/reset-password', validate(authSchemas.resetPassword, 'body'), authController.resetPassword);

module.exports = router;
