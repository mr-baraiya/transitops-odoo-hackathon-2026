const { query } = require('../config/db');

const DocumentsModel = {
  findByVehicle: (vehicleId) =>
    query(
      `SELECT * FROM vehicle_documents WHERE vehicle_id = $1 ORDER BY uploaded_at DESC`,
      [vehicleId]
    ),

  findById: (id) =>
    query(`SELECT * FROM vehicle_documents WHERE id = $1`, [id]),

  create: ({ vehicle_id, document_type, original_name, file_path, mime_type, file_size }) =>
    query(
      `INSERT INTO vehicle_documents (vehicle_id, document_type, original_name, file_path, mime_type, file_size)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [vehicle_id, document_type, original_name, file_path, mime_type, file_size]
    ),

  remove: (id) =>
    query(`DELETE FROM vehicle_documents WHERE id = $1 RETURNING *`, [id]),
};

module.exports = DocumentsModel;
