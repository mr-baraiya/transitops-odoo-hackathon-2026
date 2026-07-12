const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const vehiclesRoutes = require('./vehicles.routes');
const driversRoutes = require('./drivers.routes');
const tripsRoutes = require('./trips.routes');
const maintenanceRoutes = require('./maintenance.routes');
const fuelLogsRoutes = require('./fuelLogs.routes');
const expensesRoutes = require('./expenses.routes');
const dashboardRoutes = require('./dashboard.routes');
const reportsRoutes = require('./reports.routes');
const documentsRoutes = require('./documents.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/vehicles', vehiclesRoutes);
router.use('/drivers', driversRoutes);
router.use('/trips', tripsRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/fuel-logs', fuelLogsRoutes);
router.use('/expenses', expensesRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportsRoutes);
router.use('/', documentsRoutes); // Handles /vehicles/:id/documents and /documents/:id/download

module.exports = router;
