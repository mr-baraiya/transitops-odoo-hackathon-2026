const path = require('path');
const fs = require('fs');
const DocumentsModel = require('../models/documents.model');
const asyncHandler = require('../utils/asyncHandler');
const { success, created, notFound, badRequest } = require('../utils/apiResponse');

exports.upload = asyncHandler(async (req, res) => {
  if (!req.file) {
    return badRequest(res, 'No file uploaded');
  }

  const { document_type } = req.body;
  const result = await DocumentsModel.create({
    vehicle_id: req.params.id,
    document_type: document_type || 'Other',
    original_name: req.file.originalname,
    file_path: req.file.path,
    mime_type: req.file.mimetype,
    file_size: req.file.size,
  });

  return created(res, result.rows[0], 'Document uploaded');
});

exports.listByVehicle = asyncHandler(async (req, res) => {
  const result = await DocumentsModel.findByVehicle(req.params.id);
  return success(res, result.rows);
});

exports.download = asyncHandler(async (req, res) => {
  const result = await DocumentsModel.findById(req.params.id);
  if (result.rows.length === 0) return notFound(res, 'Document not found');

  const doc = result.rows[0];
  if (!fs.existsSync(doc.file_path)) {
    return notFound(res, 'File not found on disk');
  }

  res.download(doc.file_path, doc.original_name);
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await DocumentsModel.findById(req.params.id);
  if (result.rows.length === 0) return notFound(res, 'Document not found');

  const doc = result.rows[0];

  // Delete file from disk
  if (fs.existsSync(doc.file_path)) {
    fs.unlinkSync(doc.file_path);
  }

  await DocumentsModel.remove(req.params.id);
  return success(res, null, 'Document removed');
});
