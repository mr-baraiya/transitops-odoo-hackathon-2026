const DriversModel = require('../models/drivers.model');
const LicenseReminderService = require('../services/licenseReminder.service');
const asyncHandler = require('../utils/asyncHandler');
const { success, created, notFound } = require('../utils/apiResponse');

exports.getAll = asyncHandler(async (req, res) => {
  const result = await DriversModel.findAll(req.query);
  return success(res, result.rows);
});

exports.getAvailable = asyncHandler(async (req, res) => {
  const result = await DriversModel.findAvailable();
  return success(res, result.rows);
});

exports.getById = asyncHandler(async (req, res) => {
  const result = await DriversModel.findById(req.params.id);
  if (result.rows.length === 0) return notFound(res, 'Driver not found');
  return success(res, result.rows[0]);
});

exports.create = asyncHandler(async (req, res) => {
  const result = await DriversModel.create(req.body);
  return created(res, result.rows[0], 'Driver profile created');
});

exports.update = asyncHandler(async (req, res) => {
  const allowed = ['license_number', 'license_category', 'license_expiry'];
  const fields = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) fields[key] = req.body[key];
  }

  const result = await DriversModel.update(req.params.id, fields);
  if (result.rows.length === 0) return notFound(res, 'Driver not found');
  return success(res, result.rows[0], 'Driver updated');
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const result = await DriversModel.updateStatus(req.params.id, status);
  if (result.rows.length === 0) return notFound(res, 'Driver not found');
  return success(res, result.rows[0], `Driver status changed to ${status}`);
});

exports.updateSafetyScore = asyncHandler(async (req, res) => {
  const { safety_score } = req.body;
  const result = await DriversModel.updateSafetyScore(req.params.id, safety_score);
  if (result.rows.length === 0) return notFound(res, 'Driver not found');
  return success(res, result.rows[0], 'Safety score updated');
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await DriversModel.remove(req.params.id);
  if (result.rows.length === 0) return notFound(res, 'Driver not found');
  return success(res, result.rows[0], 'Driver removed');
});

exports.licenseAlerts = asyncHandler(async (req, res) => {
  const result = await LicenseReminderService.getAlerts();
  return success(res, result.rows);
});

exports.sendLicenseReminders = asyncHandler(async (req, res) => {
  const result = await LicenseReminderService.sendReminders();
  return success(res, result, `Sent ${result.sent} reminders`);
});
