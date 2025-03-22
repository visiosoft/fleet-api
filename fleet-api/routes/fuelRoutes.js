const express = require('express');
const router = express.Router();
const fuelController = require('../controllers/fuelController');

// GET /api/fuel - Get all fuel records
router.get('/', fuelController.getAllFuelRecords);

// GET /api/fuel/:id - Get a specific fuel record
router.get('/:id', fuelController.getFuelRecordById);

// POST /api/fuel - Create a new fuel record
router.post('/', fuelController.createFuelRecord);

// PUT /api/fuel/:id - Update a fuel record
router.put('/:id', fuelController.updateFuelRecord);

// DELETE /api/fuel/:id - Delete a fuel record
router.delete('/:id', fuelController.deleteFuelRecord);

// GET /api/fuel/vehicle/:vehicleId - Get fuel records for a specific vehicle
router.get('/vehicle/:vehicleId', fuelController.getFuelRecordsByVehicle);

// GET /api/fuel/stats/consumption - Get fuel consumption statistics
router.get('/stats/consumption', fuelController.getFuelConsumptionStats);

module.exports = router; 