const { query } = require('../config/db');

const MaintenanceModel = {
  findAll: (filters = {}) => {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (filters.status) {
      conditions.push(`m.status = $${idx++}`);
      params.push(filters.status);
    }
    if (filters.vehicle_id) {
      conditions.push(`m.vehicle_id = $${idx++}`);
      params.push(filters.vehicle_id);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    return query(
      `SELECT m.*, v.registration_number, v.vehicle_name
       FROM maintenance_logs m
       JOIN vehicles v ON v.id = m.vehicle_id
       ${where}
       ORDER BY m.created_at DESC`,
      params
    );
  },

  findById: (id) =>
    query(
      `SELECT m.*, v.registration_number, v.vehicle_name
       FROM maintenance_logs m
       JOIN vehicles v ON v.id = m.vehicle_id
       WHERE m.id = $1`,
      [id]
    ),

  findByVehicle: (vehicleId) =>
    query(
      `SELECT * FROM maintenance_logs WHERE vehicle_id = $1 ORDER BY start_date DESC`,
      [vehicleId]
    ),

  create: ({ vehicle_id, title, description, maintenance_type, cost, start_date, status }) =>
    query(
      `INSERT INTO maintenance_logs (vehicle_id, title, description, maintenance_type, cost, start_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [vehicle_id, title, description, maintenance_type, cost, start_date, status || 'Pending']
    ),

  update: (id, fields) => {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    return query(
      `UPDATE maintenance_logs SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
  },

  close: (id, cost, end_date) =>
    query(
      `UPDATE maintenance_logs SET status = 'Completed', cost = COALESCE($2, cost), end_date = COALESCE($3, CURRENT_DATE)
       WHERE id = $1 RETURNING *`,
      [id, cost, end_date]
    ),

  remove: (id) =>
    query(`DELETE FROM maintenance_logs WHERE id = $1 RETURNING *`, [id]),
};

module.exports = MaintenanceModel;
