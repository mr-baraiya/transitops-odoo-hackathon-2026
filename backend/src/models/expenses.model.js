const { query } = require('../config/db');

const ExpensesModel = {
  findAll: (filters = {}) => {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (filters.vehicle_id) {
      conditions.push(`e.vehicle_id = $${idx++}`);
      params.push(filters.vehicle_id);
    }
    if (filters.type) {
      conditions.push(`e.expense_type = $${idx++}`);
      params.push(filters.type);
    }
    if (filters.from) {
      conditions.push(`e.expense_date >= $${idx++}`);
      params.push(filters.from);
    }
    if (filters.to) {
      conditions.push(`e.expense_date <= $${idx++}`);
      params.push(filters.to);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    return query(
      `SELECT e.*, v.registration_number, v.vehicle_name
       FROM expenses e
       JOIN vehicles v ON v.id = e.vehicle_id
       ${where}
       ORDER BY e.expense_date DESC`,
      params
    );
  },

  findById: (id) =>
    query(`SELECT * FROM expenses WHERE id = $1`, [id]),

  create: ({ vehicle_id, trip_id, expense_type, amount, description, expense_date }) =>
    query(
      `INSERT INTO expenses (vehicle_id, trip_id, expense_type, amount, description, expense_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [vehicle_id, trip_id || null, expense_type, amount, description, expense_date || new Date()]
    ),

  update: (id, fields) => {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    return query(
      `UPDATE expenses SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
  },

  remove: (id) =>
    query(`DELETE FROM expenses WHERE id = $1 RETURNING *`, [id]),

  totalByVehicle: (vehicleId) =>
    query(
      `SELECT
         COALESCE(SUM(amount) FILTER (WHERE expense_type = 'Fuel'), 0) AS fuel_cost,
         COALESCE(SUM(amount) FILTER (WHERE expense_type = 'Maintenance'), 0) AS maintenance_cost,
         COALESCE(SUM(amount), 0) AS total_cost
       FROM expenses
       WHERE vehicle_id = $1`,
      [vehicleId]
    ),
};

module.exports = ExpensesModel;
