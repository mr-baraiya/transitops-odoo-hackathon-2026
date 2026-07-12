const express = require('express');
const router = express.Router();
const tripsController = require('../controllers/trips.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate');
const { tripSchemas } = require('../middleware/schemas');

router.use(authenticate);

router.get('/', tripsController.getAll);
router.get('/:id', tripsController.getById);

router.post('/', authorize('Driver', 'Fleet Manager'), validate(tripSchemas.create, 'body'), tripsController.create);
router.patch('/:id/dispatch', authorize('Driver', 'Fleet Manager'), tripsController.dispatch);
router.patch('/:id/complete', authorize('Driver', 'Fleet Manager'), validate(tripSchemas.complete, 'body'), tripsController.complete);
router.patch('/:id/cancel', authorize('Driver', 'Fleet Manager'), tripsController.cancel);
router.patch('/:id', authorize('Driver', 'Fleet Manager'), validate(tripSchemas.update, 'body'), tripsController.update);
router.delete('/:id', authorize('Fleet Manager'), tripsController.remove);

module.exports = router;
