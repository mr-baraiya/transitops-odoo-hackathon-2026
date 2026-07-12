const Joi = require('joi');

const authSchemas = {
  register: Joi.object({
    role_id: Joi.number().integer().required(),
    first_name: Joi.string().max(100).required(),
    last_name: Joi.string().max(100).required(),
    email: Joi.string().email().max(150).required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().max(20).allow('', null),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const userSchemas = {
  update: Joi.object({
    role_id: Joi.number().integer(),
    first_name: Joi.string().max(100),
    last_name: Joi.string().max(100),
    phone: Joi.string().max(20).allow('', null),
    status: Joi.string().valid('Active', 'Inactive'),
  }),
};

const vehicleSchemas = {
  create: Joi.object({
    registration_number: Joi.string().max(20).required(),
    vehicle_name: Joi.string().max(100).required(),
    model: Joi.string().max(100).allow('', null),
    vehicle_type: Joi.string().max(50).required(),
    max_load_capacity: Joi.number().min(0).required(),
    odometer: Joi.number().min(0).default(0),
    acquisition_cost: Joi.number().min(0).allow(null),
    purchase_date: Joi.date().iso().allow(null),
    status: Joi.string().valid('Available', 'On Trip', 'In Shop', 'Retired').default('Available'),
    region: Joi.string().max(100).allow('', null),
  }),
  update: Joi.object({
    registration_number: Joi.string().max(20),
    vehicle_name: Joi.string().max(100),
    model: Joi.string().max(100).allow('', null),
    vehicle_type: Joi.string().max(50),
    max_load_capacity: Joi.number().min(0),
    odometer: Joi.number().min(0),
    acquisition_cost: Joi.number().min(0).allow(null),
    purchase_date: Joi.date().iso().allow(null),
    status: Joi.string().valid('Available', 'On Trip', 'In Shop', 'Retired'),
    region: Joi.string().max(100).allow('', null),
  }),
  updateStatus: Joi.object({
    status: Joi.string().valid('Available', 'On Trip', 'In Shop', 'Retired').required(),
  }),
};

const driverSchemas = {
  create: Joi.object({
    user_id: Joi.number().integer().required(),
    license_number: Joi.string().max(50).required(),
    license_category: Joi.string().max(20).allow('', null),
    license_expiry: Joi.date().iso().required(),
    safety_score: Joi.number().min(0).max(100).default(100),
    status: Joi.string().valid('Available', 'On Trip', 'Off Duty', 'Suspended').default('Available'),
  }),
  update: Joi.object({
    license_number: Joi.string().max(50),
    license_category: Joi.string().max(20).allow('', null),
    license_expiry: Joi.date().iso(),
  }),
  updateStatus: Joi.object({
    status: Joi.string().valid('Available', 'On Trip', 'Off Duty', 'Suspended').required(),
  }),
  updateSafetyScore: Joi.object({
    safety_score: Joi.number().min(0).max(100).required(),
  }),
};

const tripSchemas = {
  create: Joi.object({
    vehicle_id: Joi.number().integer().required(),
    driver_id: Joi.number().integer().required(),
    source: Joi.string().max(150).required(),
    destination: Joi.string().max(150).required(),
    cargo_weight: Joi.number().min(0).required(),
    planned_distance: Joi.number().min(0).allow(null),
    revenue: Joi.number().min(0).default(0),
    remarks: Joi.string().allow('', null),
  }),
  update: Joi.object({
    vehicle_id: Joi.number().integer(),
    driver_id: Joi.number().integer(),
    source: Joi.string().max(150),
    destination: Joi.string().max(150),
    cargo_weight: Joi.number().min(0),
    planned_distance: Joi.number().min(0).allow(null),
    revenue: Joi.number().min(0),
    remarks: Joi.string().allow('', null),
  }),
  complete: Joi.object({
    actual_distance: Joi.number().min(0).allow(null),
    end_time: Joi.date().iso().allow(null),
  }),
};

const maintenanceSchemas = {
  create: Joi.object({
    vehicle_id: Joi.number().integer().required(),
    title: Joi.string().max(150).required(),
    description: Joi.string().allow('', null),
    maintenance_type: Joi.string().max(50).required(),
    cost: Joi.number().min(0).allow(null),
    start_date: Joi.date().iso().required(),
    status: Joi.string().valid('Pending', 'In Progress', 'Completed').default('Pending'),
  }),
  update: Joi.object({
    title: Joi.string().max(150),
    description: Joi.string().allow('', null),
    maintenance_type: Joi.string().max(50),
    cost: Joi.number().min(0).allow(null),
    start_date: Joi.date().iso(),
    end_date: Joi.date().iso().allow(null),
    status: Joi.string().valid('Pending', 'In Progress', 'Completed'),
  }),
  close: Joi.object({
    cost: Joi.number().min(0).allow(null),
    end_date: Joi.date().iso().allow(null),
  }),
};

const fuelLogSchemas = {
  create: Joi.object({
    vehicle_id: Joi.number().integer().required(),
    trip_id: Joi.number().integer().allow(null),
    liters: Joi.number().positive().required(),
    cost: Joi.number().min(0).required(),
    fuel_date: Joi.date().iso().allow(null),
    odometer: Joi.number().min(0).allow(null),
  }),
};

const expenseSchemas = {
  create: Joi.object({
    vehicle_id: Joi.number().integer().required(),
    trip_id: Joi.number().integer().allow(null),
    expense_type: Joi.string().valid('Fuel', 'Maintenance', 'Toll', 'Insurance', 'Repair', 'Other').required(),
    amount: Joi.number().min(0).required(),
    description: Joi.string().allow('', null),
    expense_date: Joi.date().iso().allow(null),
  }),
  update: Joi.object({
    expense_type: Joi.string().valid('Fuel', 'Maintenance', 'Toll', 'Insurance', 'Repair', 'Other'),
    amount: Joi.number().min(0),
    description: Joi.string().allow('', null),
    expense_date: Joi.date().iso(),
  }),
};

module.exports = {
  authSchemas,
  userSchemas,
  vehicleSchemas,
  driverSchemas,
  tripSchemas,
  maintenanceSchemas,
  fuelLogSchemas,
  expenseSchemas,
};
