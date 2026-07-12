const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');

router.use(authenticate);
router.use(authorize('Finance', 'Fleet Manager'));

router.get('/fuel-efficiency', reportsController.fuelEfficiency);
router.get('/utilization', reportsController.utilization);
router.get('/operational-cost', reportsController.operationalCost);
router.get('/roi', reportsController.roi);
router.get('/export/csv', reportsController.exportCsv);
router.get('/export/pdf', reportsController.exportPdf);

module.exports = router;
