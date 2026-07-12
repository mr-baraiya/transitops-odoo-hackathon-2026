const { query } = require('../config/db');
const TripsModel = require('../models/trips.model');

const TripsService = {
  getAll: (filters) => TripsModel.findAll(filters),
  getById: (id) => TripsModel.findById(id),
  create: (data) => TripsModel.create(data),
  update: (id, data) => TripsModel.update(id, data),
  remove: (id) => TripsModel.remove(id),

  /**
   * Dispatch a trip — the DB trigger (fn_trip_status_change) handles:
   *   - vehicle/driver availability check
   *   - cargo vs capacity check
   *   - license expiry check
   *   - flipping vehicle/driver to 'On Trip'
   * If any check fails, the trigger raises an exception caught by errorHandler.
   */
  dispatch: async (id) => {
    const trip = await TripsModel.findById(id);
    if (trip.rows.length === 0) throw Object.assign(new Error('Trip not found'), { statusCode: 404 });

    const t = trip.rows[0];
    if (t.status !== 'Draft') {
      throw Object.assign(new Error(`Cannot dispatch — trip is ${t.status}, expected Draft`), { statusCode: 400 });
    }

    // The DB trigger validates everything on status change
    return TripsModel.updateStatus(id, 'Dispatched');
  },

  /**
   * Complete a trip — DB trigger frees vehicle/driver
   */
  complete: async (id, { actual_distance, end_time } = {}) => {
    const trip = await TripsModel.findById(id);
    if (trip.rows.length === 0) throw Object.assign(new Error('Trip not found'), { statusCode: 404 });

    const t = trip.rows[0];
    if (t.status !== 'Dispatched') {
      throw Object.assign(new Error(`Cannot complete — trip is ${t.status}, expected Dispatched`), { statusCode: 400 });
    }

    const extra = {};
    if (actual_distance !== undefined) extra.actual_distance = actual_distance;
    if (end_time) extra.end_time = end_time;

    return TripsModel.updateStatus(id, 'Completed', extra);
  },

  /**
   * Cancel a trip — DB trigger frees vehicle/driver
   */
  cancel: async (id) => {
    const trip = await TripsModel.findById(id);
    if (trip.rows.length === 0) throw Object.assign(new Error('Trip not found'), { statusCode: 404 });

    const t = trip.rows[0];
    if (t.status !== 'Dispatched') {
      throw Object.assign(new Error(`Cannot cancel — trip is ${t.status}, expected Dispatched`), { statusCode: 400 });
    }

    return TripsModel.updateStatus(id, 'Cancelled');
  },
};

module.exports = TripsService;
