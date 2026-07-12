const { query } = require('../config/db');

const DriversModel = {
  findAll: (filters = {}) => {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (filters.status) {
      conditions.push(`d.status = $${idx++}`);
      params.push(filters.status);
    }
    if (filters.license_category) {
      conditions.push(`d.license_category = $${idx++}`);
      params.push(filters.license_category);
    }
    if (filters.search) {
      conditions.push(`(u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx} OR u.email ILIKE $${idx} OR d.license_number ILIKE $${idx})`);
      params.push(`%${filters.search}%`);
      idx++;
    }

    const allowedSortColumns = {
      id: 'd.id',
      license_number: 'd.license_number',
      license_category: 'd.license_category',
      license_expiry: 'd.license_expiry',
      safety_score: 'd.safety_score',
      status: 'd.status',
      first_name: 'u.first_name',
      last_name: 'u.last_name',
      email: 'u.email'
    };
    const sortBy = allowedSortColumns[filters.sortBy] || 'd.id';
    const sortOrder = filters.sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    return query(
      `SELECT d.*, u.first_name, u.last_name, u.email, u.phone
       FROM drivers d
       JOIN users u ON u.id = d.user_id
       ${where}
       ORDER BY ${sortBy} ${sortOrder}`,
      params
    );
  },

  findAvailable: () =>
    query(
      `SELECT d.*, u.first_name, u.last_name, u.email, u.phone
       FROM drivers d
       JOIN users u ON u.id = d.user_id
       WHERE d.status = 'Available' AND d.license_expiry >= CURRENT_DATE
       ORDER BY u.first_name`
    ),

  findById: (id) =>
    query(
      `SELECT d.*, u.first_name, u.last_name, u.email, u.phone
       FROM drivers d
       JOIN users u ON u.id = d.user_id
       WHERE d.id = $1`,
      [id]
    ),

  findByUserId: (userId) =>
    query(`SELECT * FROM drivers WHERE user_id = $1`, [userId]),

  create: ({ user_id, license_number, license_category, license_expiry, safety_score, status }) =>
    query(
      `INSERT INTO drivers (user_id, license_number, license_category, license_expiry, safety_score, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, license_number, license_category, license_expiry, safety_score || 100, status || 'Available']
    ),

  update: (id, fields) => {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    return query(
      `UPDATE drivers SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
  },

  updateStatus: (id, status) =>
    query(`UPDATE drivers SET status = $2 WHERE id = $1 RETURNING *`, [id, status]),

  updateSafetyScore: (id, safety_score) =>
    query(`UPDATE drivers SET safety_score = $2 WHERE id = $1 RETURNING *`, [id, safety_score]),

  remove: (id) =>
    query(`DELETE FROM drivers WHERE id = $1 RETURNING *`, [id]),

  licenseAlerts: () =>
    query(`SELECT * FROM v_license_alerts`),
};

module.exports = DriversModel;
