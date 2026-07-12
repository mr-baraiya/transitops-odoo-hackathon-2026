const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test connection
pool.connect()
  .then((client) => {
    console.log('Connected to PostgreSQL (Neon)');
    client.release();
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
  });

/**
 * Execute a query against the database
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
