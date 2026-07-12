const FuelLogsModel = require('../models/fuelLogs.model');
const asyncHandler = require('../utils/asyncHandler');
const { success, created, notFound } = require('../utils/apiResponse');

exports.getAll = asyncHandler(async (req, res) => {
  const result = await FuelLogsModel.findAll(req.query);
  return success(res, result.rows);
});

exports.create = asyncHandler(async (req, res) => {
  const result = await FuelLogsModel.create(req.body);
  return created(res, result.rows[0], 'Fuel log recorded');
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await FuelLogsModel.remove(req.params.id);
  if (result.rows.length === 0) return notFound(res, 'Fuel log not found');
  return success(res, result.rows[0], 'Fuel log removed');
});
