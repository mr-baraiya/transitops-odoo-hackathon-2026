const { query } = require('../config/db');

const VehiclesModel = {
  findAll: (filters = {}) => {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (filters.type) {
      conditions.push(`vehicle_type = $${idx++}`);
      params.push(filters.type);
    }
    if (filters.status) {
      conditions.push(`status = $${idx++}`);
      params.push(filters.status);
    }
    if (filters.region) {
      conditions.push(`region = $${idx++}`);
      params.push(filters.region);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    return query(`SELECT * FROM vehicles ${where} ORDER BY id`, params);
  },

  findAvailable: () =>
    query(`SELECT * FROM vehicles WHERE status = 'Available' ORDER BY vehicle_name`),

  findById: (id) =>
    query(`SELECT * FROM vehicles WHERE id = $1`, [id]),

  create: ({ registration_number, vehicle_name, model, vehicle_type, max_load_capacity, odometer, acquisition_cost, purchase_date, status, region }) =>
    query(
      `INSERT INTO vehicles (registration_number, vehicle_name, model, vehicle_type, max_load_capacity, odometer, acquisition_cost, purchase_date, status, region)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [registration_number, vehicle_name, model, vehicle_type, max_load_capacity, odometer || 0, acquisition_cost, purchase_date, status || 'Available', region]
    ),

  update: (id, fields) => {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    return query(
      `UPDATE vehicles SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
  },

  updateStatus: (id, status) =>
    query(`UPDATE vehicles SET status = $2 WHERE id = $1 RETURNING *`, [id, status]),

  remove: (id) =>
    query(`UPDATE vehicles SET status = 'Retired' WHERE id = $1 RETURNING *`, [id]),
};

module.exports = VehiclesModel;
