const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// GET /api/vehicles - Get all vehicles
router.get('/', vehicleController.getAllVehicles);

// GET /api/vehicles/:id - Get a specific vehicle
router.get('/:id', vehicleController.getVehicleById);

// POST /api/vehicles - Create a new vehicle
router.post('/', vehicleController.createVehicle);

// PUT /api/vehicles/:id - Update a vehicle
router.put('/:id', vehicleController.updateVehicle);

// DELETE /api/vehicles/:id - Delete a vehicle
router.delete('/:id', vehicleController.deleteVehicle);

module.exports = router; 