const { query } = require('../config/db');

const TripsModel = {
  findAll: (filters = {}) => {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (filters.status) {
      conditions.push(`t.status = $${idx++}`);
      params.push(filters.status);
    }
    if (filters.vehicle_id) {
      conditions.push(`t.vehicle_id = $${idx++}`);
      params.push(filters.vehicle_id);
    }
    if (filters.driver_id) {
      conditions.push(`t.driver_id = $${idx++}`);
      params.push(filters.driver_id);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    return query(
      `SELECT t.*,
              v.registration_number, v.vehicle_name,
              u.first_name AS driver_first_name, u.last_name AS driver_last_name
       FROM trips t
       JOIN vehicles v ON v.id = t.vehicle_id
       JOIN drivers d ON d.id = t.driver_id
       JOIN users u ON u.id = d.user_id
       ${where}
       ORDER BY t.created_at DESC`,
      params
    );
  },

  findById: (id) =>
    query(
      `SELECT t.*,
              v.registration_number, v.vehicle_name,
              u.first_name AS driver_first_name, u.last_name AS driver_last_name
       FROM trips t
       JOIN vehicles v ON v.id = t.vehicle_id
       JOIN drivers d ON d.id = t.driver_id
       JOIN users u ON u.id = d.user_id
       WHERE t.id = $1`,
      [id]
    ),

  create: ({ vehicle_id, driver_id, source, destination, cargo_weight, planned_distance, revenue, remarks }) =>
    query(
      `INSERT INTO trips (vehicle_id, driver_id, source, destination, cargo_weight, planned_distance, revenue, remarks, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Draft')
       RETURNING *`,
      [vehicle_id, driver_id, source, destination, cargo_weight, planned_distance, revenue || 0, remarks]
    ),

  update: (id, fields) => {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    return query(
      `UPDATE trips SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
  },

  updateStatus: (id, status, extraFields = {}) => {
    const keys = ['status', ...Object.keys(extraFields)];
    const values = [status, ...Object.values(extraFields)];
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    return query(
      `UPDATE trips SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
  },

  remove: (id) =>
    query(`DELETE FROM trips WHERE id = $1 AND status = 'Draft' RETURNING *`, [id]),
};

module.exports = TripsModel;
