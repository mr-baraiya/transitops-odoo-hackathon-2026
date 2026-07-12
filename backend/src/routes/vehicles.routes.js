const express = require('express');
const router = express.Router();
const vehiclesController = require('../controllers/vehicles.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate');
const { vehicleSchemas } = require('../middleware/schemas');

router.use(authenticate);

router.get('/', vehiclesController.getAll);
router.get('/available', authorize('Driver', 'Fleet Manager'), vehiclesController.getAvailable);
router.get('/:id', vehiclesController.getById);

router.post('/', authorize('Fleet Manager'), validate(vehicleSchemas.create, 'body'), vehiclesController.create);
router.patch('/:id', authorize('Fleet Manager'), validate(vehicleSchemas.update, 'body'), vehiclesController.update);
router.patch('/:id/status', authorize('Fleet Manager'), validate(vehicleSchemas.updateStatus, 'body'), vehiclesController.updateStatus);
router.delete('/:id', authorize('Fleet Manager'), vehiclesController.remove);

module.exports = router;
