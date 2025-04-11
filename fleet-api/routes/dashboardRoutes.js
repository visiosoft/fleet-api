const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all dashboard routes
router.use(authenticate);

// Get both active vehicles and drivers counts
router.get('/active-counts', DashboardController.getActiveCounts);

// Get active vehicles count and details
router.get('/active-vehicles', DashboardController.getActiveVehicles);

// Get active drivers count and details
router.get('/active-drivers', DashboardController.getActiveDrivers);

// Get current month's fuel consumption cost
router.get('/fuel/current-month', DashboardController.getCurrentMonthFuelCost);

// Get current month's fuel consumption by vehicle
router.get('/fuel/current-month/by-vehicle', DashboardController.getCurrentMonthFuelByVehicle);

// Get current month's maintenance cost
router.get('/maintenance/current-month', DashboardController.getCurrentMonthMaintenanceCost);

// Get current month's maintenance cost by vehicle
router.get('/maintenance/current-month/by-vehicle', DashboardController.getCurrentMonthMaintenanceByVehicle);

// Get contract statistics
router.get('/contracts/stats', DashboardController.getContractStats);

module.exports = router; 