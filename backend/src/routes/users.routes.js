const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate');
const { userSchemas } = require('../middleware/schemas');

// All user routes require authentication
router.use(authenticate);

router.get('/', authorize('Fleet Manager'), userController.getAll);

router.get('/:id', (req, res, next) => {
  if (req.user.role_name === 'Fleet Manager' || req.user.id === parseInt(req.params.id, 10)) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied. You can only view your own profile.' });
}, userController.getById);

router.patch('/:id', authorize('Fleet Manager'), validate(userSchemas.update, 'body'), userController.update);

router.delete('/:id', authorize('Fleet Manager'), userController.remove);

module.exports = router;
