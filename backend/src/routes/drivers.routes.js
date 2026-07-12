const express = require('express');
const router = express.Router();
const driversController = require('../controllers/drivers.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate');
const { driverSchemas } = require('../middleware/schemas');

router.use(authenticate);

router.get('/', driversController.getAll);
router.get('/available', authorize('Driver', 'Fleet Manager'), driversController.getAvailable);
router.get('/license-alerts', authorize('Safety Officer', 'Fleet Manager'), driversController.licenseAlerts);
router.post('/license-alerts/send', authorize('Safety Officer'), driversController.sendLicenseReminders);

router.get('/:id', driversController.getById);
router.post('/', authorize('Fleet Manager'), validate(driverSchemas.create, 'body'), driversController.create);
router.patch('/:id', authorize('Fleet Manager', 'Safety Officer'), validate(driverSchemas.update, 'body'), driversController.update);
router.patch('/:id/status', authorize('Safety Officer', 'Fleet Manager'), validate(driverSchemas.updateStatus, 'body'), driversController.updateStatus);
router.patch('/:id/safety-score', authorize('Safety Officer'), validate(driverSchemas.updateSafetyScore, 'body'), driversController.updateSafetyScore);
router.delete('/:id', authorize('Fleet Manager'), driversController.remove);

module.exports = router;
