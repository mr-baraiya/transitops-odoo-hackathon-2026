const express = require('express');
const router = express.Router();
const expensesController = require('../controllers/expenses.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate');
const { expenseSchemas } = require('../middleware/schemas');

router.use(authenticate);

router.get('/', authorize('Finance', 'Fleet Manager'), expensesController.getAll);
router.post('/', authorize('Fleet Manager', 'Finance'), validate(expenseSchemas.create, 'body'), expensesController.create);
router.patch('/:id', authorize('Finance', 'Fleet Manager'), validate(expenseSchemas.update, 'body'), expensesController.update);
router.delete('/:id', authorize('Finance', 'Fleet Manager'), expensesController.remove);
router.get('/vehicle/:id/total', authorize('Finance', 'Fleet Manager'), expensesController.totalByVehicle);

module.exports = router;
