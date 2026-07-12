const { query } = require('../config/db');

const FuelLogsModel = {
  findAll: (filters = {}) => {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (filters.vehicle_id) {
      conditions.push(`f.vehicle_id = $${idx++}`);
      params.push(filters.vehicle_id);
    }
    if (filters.trip_id) {
      conditions.push(`f.trip_id = $${idx++}`);
      params.push(filters.trip_id);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    return query(
      `SELECT f.*, v.registration_number, v.vehicle_name
       FROM fuel_logs f
       JOIN vehicles v ON v.id = f.vehicle_id
       ${where}
       ORDER BY f.fuel_date DESC`,
      params
    );
  },

  findById: (id) =>
    query(`SELECT * FROM fuel_logs WHERE id = $1`, [id]),

  findByVehicle: (vehicleId) =>
    query(`SELECT * FROM fuel_logs WHERE vehicle_id = $1 ORDER BY fuel_date DESC`, [vehicleId]),

  create: ({ vehicle_id, trip_id, liters, cost, fuel_date, odometer }) =>
    query(
      `INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, fuel_date, odometer)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [vehicle_id, trip_id || null, liters, cost, fuel_date || new Date(), odometer]
    ),

  remove: (id) =>
    query(`DELETE FROM fuel_logs WHERE id = $1 RETURNING *`, [id]),
};

module.exports = FuelLogsModel;
