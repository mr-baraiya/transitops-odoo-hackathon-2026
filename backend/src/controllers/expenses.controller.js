const ExpensesModel = require('../models/expenses.model');
const asyncHandler = require('../utils/asyncHandler');
const { success, created, notFound } = require('../utils/apiResponse');

exports.getAll = asyncHandler(async (req, res) => {
  const result = await ExpensesModel.findAll(req.query);
  return success(res, result.rows);
});

exports.create = asyncHandler(async (req, res) => {
  const result = await ExpensesModel.create(req.body);
  return created(res, result.rows[0], 'Expense logged');
});

exports.update = asyncHandler(async (req, res) => {
  const allowed = ['expense_type', 'amount', 'description', 'expense_date'];
  const fields = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) fields[key] = req.body[key];
  }

  const result = await ExpensesModel.update(req.params.id, fields);
  if (result.rows.length === 0) return notFound(res, 'Expense not found');
  return success(res, result.rows[0], 'Expense updated');
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await ExpensesModel.remove(req.params.id);
  if (result.rows.length === 0) return notFound(res, 'Expense not found');
  return success(res, result.rows[0], 'Expense removed');
});

exports.totalByVehicle = asyncHandler(async (req, res) => {
  const result = await ExpensesModel.totalByVehicle(req.params.id);
  return success(res, result.rows[0]);
});
