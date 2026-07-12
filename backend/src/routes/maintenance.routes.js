const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenance.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate');
const { maintenanceSchemas } = require('../middleware/schemas');

router.use(authenticate);

router.get('/', authorize('Fleet Manager', 'Safety Officer'), maintenanceController.getAll);
router.get('/:id', authorize('Fleet Manager', 'Safety Officer'), maintenanceController.getById);

router.post('/', authorize('Fleet Manager'), validate(maintenanceSchemas.create, 'body'), maintenanceController.create);
router.patch('/:id/close', authorize('Fleet Manager'), validate(maintenanceSchemas.close, 'body'), maintenanceController.close);
router.patch('/:id', authorize('Fleet Manager'), validate(maintenanceSchemas.update, 'body'), maintenanceController.update);
router.delete('/:id', authorize('Fleet Manager'), maintenanceController.remove);

module.exports = router;
