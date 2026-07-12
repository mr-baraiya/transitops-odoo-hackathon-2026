const MaintenanceService = require('../services/maintenance.service');
const asyncHandler = require('../utils/asyncHandler');
const { success, created, notFound } = require('../utils/apiResponse');

exports.getAll = asyncHandler(async (req, res) => {
  const result = await MaintenanceService.getAll(req.query);
  return success(res, result.rows);
});

exports.getById = asyncHandler(async (req, res) => {
  const result = await MaintenanceService.getById(req.params.id);
  if (result.rows.length === 0) return notFound(res, 'Maintenance record not found');
  return success(res, result.rows[0]);
});

exports.create = asyncHandler(async (req, res) => {
  const result = await MaintenanceService.create(req.body);
  return created(res, result.rows[0], 'Maintenance record created');
});

exports.update = asyncHandler(async (req, res) => {
  const allowed = ['title', 'description', 'maintenance_type', 'cost', 'start_date', 'end_date'];
  const fields = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) fields[key] = req.body[key];
  }

  const result = await MaintenanceService.update(req.params.id, fields);
  if (result.rows.length === 0) return notFound(res, 'Maintenance record not found');
  return success(res, result.rows[0], 'Maintenance record updated');
});

exports.close = asyncHandler(async (req, res) => {
  const { cost, end_date } = req.body;
  const result = await MaintenanceService.close(req.params.id, cost, end_date);
  return success(res, result.rows[0], 'Maintenance completed');
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await MaintenanceService.remove(req.params.id);
  if (result.rows.length === 0) return notFound(res, 'Maintenance record not found');
  return success(res, result.rows[0], 'Maintenance record removed');
});
