const express = require('express');
const router = express.Router();
const documentsController = require('../controllers/documents.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');
const upload = require('../middleware/upload.middleware');

router.use(authenticate);

router.post('/vehicles/:id/documents', authorize('Fleet Manager'), upload.single('document'), documentsController.upload);
router.get('/vehicles/:id/documents', authorize('Fleet Manager', 'Safety Officer'), documentsController.listByVehicle);
router.get('/documents/:id/download', authorize('Fleet Manager', 'Safety Officer'), documentsController.download);
router.delete('/documents/:id', authorize('Fleet Manager'), documentsController.remove);

module.exports = router;
