const UsersModel = require('../models/users.model');
const asyncHandler = require('../utils/asyncHandler');
const { success, notFound } = require('../utils/apiResponse');

exports.getAll = asyncHandler(async (req, res) => {
  const result = await UsersModel.findAll();
  const users = result.rows.map((u) => { delete u.password_hash; return u; });
  return success(res, users);
});

exports.getById = asyncHandler(async (req, res) => {
  const result = await UsersModel.findById(req.params.id);
  if (result.rows.length === 0) return notFound(res, 'User not found');

  const user = result.rows[0];
  delete user.password_hash;
  return success(res, user);
});

exports.update = asyncHandler(async (req, res) => {
  const allowed = ['first_name', 'last_name', 'phone', 'status', 'role_id'];
  const fields = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) fields[key] = req.body[key];
  }

  if (Object.keys(fields).length === 0) {
    return success(res, null, 'No fields to update');
  }

  const result = await UsersModel.update(req.params.id, fields);
  if (result.rows.length === 0) return notFound(res, 'User not found');

  const user = result.rows[0];
  delete user.password_hash;
  return success(res, user, 'User updated');
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await UsersModel.remove(req.params.id);
  if (result.rows.length === 0) return notFound(res, 'User not found');

  const user = result.rows[0];
  delete user.password_hash;
  return success(res, user, 'User deactivated');
});
