const MaintenanceModel = require('../models/maintenance.model');

const MaintenanceService = {
  getAll: (filters) => MaintenanceModel.findAll(filters),
  getById: (id) => MaintenanceModel.findById(id),
  getByVehicle: (vehicleId) => MaintenanceModel.findByVehicle(vehicleId),
  create: (data) => MaintenanceModel.create(data),
  update: (id, data) => MaintenanceModel.update(id, data),

  /**
   * Close maintenance — DB trigger flips vehicle back to Available
   */
  close: async (id, cost, end_date) => {
    const record = await MaintenanceModel.findById(id);
    if (record.rows.length === 0) {
      throw Object.assign(new Error('Maintenance record not found'), { statusCode: 404 });
    }
    if (record.rows[0].status === 'Completed') {
      throw Object.assign(new Error('Already completed'), { statusCode: 400 });
    }
    return MaintenanceModel.close(id, cost, end_date);
  },

  remove: (id) => MaintenanceModel.remove(id),
};

module.exports = MaintenanceService;
