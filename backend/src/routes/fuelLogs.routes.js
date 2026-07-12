const express = require('express');
const router = express.Router();
const fuelLogsController = require('../controllers/fuelLogs.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate');
const { fuelLogSchemas } = require('../middleware/schemas');

router.use(authenticate);

router.get('/', authorize('Fleet Manager', 'Finance'), fuelLogsController.getAll);
router.post('/', authorize('Driver', 'Fleet Manager'), validate(fuelLogSchemas.create, 'body'), fuelLogsController.create);
router.delete('/:id', authorize('Fleet Manager'), fuelLogsController.remove);

module.exports = router;
