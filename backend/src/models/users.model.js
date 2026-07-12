const { query } = require('../config/db');

const UsersModel = {
  findAll: () =>
    query(`SELECT u.*, r.name AS role_name
           FROM users u JOIN roles r ON r.id = u.role_id
           ORDER BY u.id`),

  findById: (id) =>
    query(`SELECT u.*, r.name AS role_name
           FROM users u JOIN roles r ON r.id = u.role_id
           WHERE u.id = $1`, [id]),

  findByEmail: (email) =>
    query(`SELECT u.*, r.name AS role_name
           FROM users u JOIN roles r ON r.id = u.role_id
           WHERE u.email = $1`, [email]),

  create: ({ role_id, first_name, last_name, email, password_hash, phone }) =>
    query(
      `INSERT INTO users (role_id, first_name, last_name, email, password_hash, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [role_id, first_name, last_name, email, password_hash, phone]
    ),

  update: (id, fields) => {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    return query(
      `UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
  },

  updateLastLogin: (id) =>
    query(`UPDATE users SET last_login = now() WHERE id = $1`, [id]),

  remove: (id) =>
    query(`UPDATE users SET status = 'Inactive' WHERE id = $1 RETURNING *`, [id]),
};

module.exports = UsersModel;
