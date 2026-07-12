const TripsService = require('../services/trips.service');
const asyncHandler = require('../utils/asyncHandler');
const { success, created, notFound } = require('../utils/apiResponse');

exports.getAll = asyncHandler(async (req, res) => {
  const result = await TripsService.getAll(req.query);
  return success(res, result.rows);
});

exports.getById = asyncHandler(async (req, res) => {
  const result = await TripsService.getById(req.params.id);
  if (result.rows.length === 0) return notFound(res, 'Trip not found');
  return success(res, result.rows[0]);
});

exports.create = asyncHandler(async (req, res) => {
  const result = await TripsService.create(req.body);
  return created(res, result.rows[0], 'Trip created as Draft');
});

exports.update = asyncHandler(async (req, res) => {
  // Only allow editing Draft trips
  const trip = await TripsService.getById(req.params.id);
  if (trip.rows.length === 0) return notFound(res, 'Trip not found');
  if (trip.rows[0].status !== 'Draft') {
    return res.status(400).json({ success: false, message: 'Can only edit Draft trips' });
  }

  const allowed = ['source', 'destination', 'cargo_weight', 'planned_distance', 'vehicle_id', 'driver_id', 'revenue', 'remarks'];
  const fields = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) fields[key] = req.body[key];
  }

  const result = await TripsService.update(req.params.id, fields);
  return success(res, result.rows[0], 'Trip updated');
});

exports.dispatch = asyncHandler(async (req, res) => {
  const result = await TripsService.dispatch(req.params.id);
  return success(res, result.rows[0], 'Trip dispatched');
});

exports.complete = asyncHandler(async (req, res) => {
  const result = await TripsService.complete(req.params.id, req.body);
  return success(res, result.rows[0], 'Trip completed');
});

exports.cancel = asyncHandler(async (req, res) => {
  const result = await TripsService.cancel(req.params.id);
  return success(res, result.rows[0], 'Trip cancelled');
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await TripsService.remove(req.params.id);
  if (result.rows.length === 0) return notFound(res, 'Draft trip not found');
  return success(res, result.rows[0], 'Trip deleted');
});
