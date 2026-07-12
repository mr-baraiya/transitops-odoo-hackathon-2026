const VehiclesModel = require('../models/vehicles.model');

const VehiclesService = {
  getAll: (filters) => VehiclesModel.findAll(filters),
  getAvailable: () => VehiclesModel.findAvailable(),
  getById: (id) => VehiclesModel.findById(id),
  create: (data) => VehiclesModel.create(data),
  update: (id, data) => VehiclesModel.update(id, data),
  updateStatus: (id, status) => VehiclesModel.updateStatus(id, status),
  retire: (id) => VehiclesModel.remove(id),
};

module.exports = VehiclesService;
