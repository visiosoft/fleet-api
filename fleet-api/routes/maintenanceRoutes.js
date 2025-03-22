const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');

// GET /api/maintenance - Get all maintenance records
router.get('/', maintenanceController.getAllMaintenanceRecords);

// GET /api/maintenance/vehicles - Get unique vehicles for dropdown
router.get('/vehicles', maintenanceController.getUniqueVehicles);

// GET /api/maintenance/statuses - Get available maintenance statuses
router.get('/statuses', maintenanceController.getMaintenanceStatuses);

// GET /api/maintenance/status/:status - Get maintenance records by status
router.get('/status/:status', maintenanceController.getMaintenanceRecordsByStatus);

// GET /api/maintenance/status/count - Get maintenance records count by status
router.get('/status/count', maintenanceController.getMaintenanceStatusCount);

// PATCH /api/maintenance/:id/status - Update maintenance status
router.patch('/:id/status', maintenanceController.updateMaintenanceStatus);

// GET /api/maintenance/:id - Get a specific maintenance record
router.get('/:id', maintenanceController.getMaintenanceRecordById);

// POST /api/maintenance - Create a new maintenance record
router.post('/', maintenanceController.createMaintenanceRecord);

// PUT /api/maintenance/:id - Update a maintenance record
router.put('/:id', maintenanceController.updateMaintenanceRecord);

// DELETE /api/maintenance/:id - Delete a maintenance record
router.delete('/:id', maintenanceController.deleteMaintenanceRecord);

// GET /api/maintenance/vehicle/:vehicleName - Get maintenance records for a specific vehicle
router.get('/vehicle/:vehicleName', maintenanceController.getMaintenanceRecordsByVehicle);

// GET /api/maintenance/service/:serviceType - Get maintenance records by service type
router.get('/service/:serviceType', maintenanceController.getMaintenanceRecordsByService);

// GET /api/maintenance/stats/cost - Get maintenance cost statistics
router.get('/stats/cost', maintenanceController.getMaintenanceCostStats);

module.exports = router; 