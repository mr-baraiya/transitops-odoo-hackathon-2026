const VehiclesService = require('../services/vehicles.service');
const asyncHandler = require('../utils/asyncHandler');
const { success, created, notFound } = require('../utils/apiResponse');

exports.getAll = asyncHandler(async (req, res) => {
  const result = await VehiclesService.getAll(req.query);
  return success(res, result.rows);
});

exports.getAvailable = asyncHandler(async (req, res) => {
  const result = await VehiclesService.getAvailable();
  return success(res, result.rows);
});

exports.getById = asyncHandler(async (req, res) => {
  const result = await VehiclesService.getById(req.params.id);
  if (result.rows.length === 0) return notFound(res, 'Vehicle not found');
  return success(res, result.rows[0]);
});

exports.create = asyncHandler(async (req, res) => {
  const result = await VehiclesService.create(req.body);
  return created(res, result.rows[0], 'Vehicle registered');
});

exports.update = asyncHandler(async (req, res) => {
  const allowed = ['vehicle_name', 'model', 'vehicle_type', 'max_load_capacity', 'odometer', 'acquisition_cost', 'purchase_date', 'region'];
  const fields = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) fields[key] = req.body[key];
  }

  const result = await VehiclesService.update(req.params.id, fields);
  if (result.rows.length === 0) return notFound(res, 'Vehicle not found');
  return success(res, result.rows[0], 'Vehicle updated');
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const result = await VehiclesService.updateStatus(req.params.id, status);
  if (result.rows.length === 0) return notFound(res, 'Vehicle not found');
  return success(res, result.rows[0], `Vehicle status changed to ${status}`);
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await VehiclesService.retire(req.params.id);
  if (result.rows.length === 0) return notFound(res, 'Vehicle not found');
  return success(res, result.rows[0], 'Vehicle retired');
});
