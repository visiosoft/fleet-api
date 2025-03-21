const { ObjectId } = require('mongodb');
const VehicleModel = require('../models/vehicleModel');
const Vehicle = require('../models/Vehicle');

/**
 * Vehicle Controller - Handles business logic for vehicle operations
 */
const VehicleController = {
  /**
   * Get all vehicles
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllVehicles(req, res) {
    try {
      const vehicles = await Vehicle.find();
      res.json(vehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      res.status(500).json({ message: 'Error fetching vehicles' });
    }
  },

  /**
   * Get a vehicle by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getVehicleById(req, res) {
    try {
      const vehicle = await Vehicle.findById(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      res.json(vehicle);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      res.status(500).json({ message: 'Error fetching vehicle' });
    }
  },

  /**
   * Create a new vehicle
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createVehicle(req, res) {
    try {
      const {
        make,
        model,
        year,
        vin,
        licensePlate,
        registrationExpiry,
        status,
        fuelType,
        currentMileage,
        lastServiceDate
      } = req.body;

      const vehicle = new Vehicle({
        make,
        model,
        year,
        vin,
        licensePlate,
        registrationExpiry,
        status,
        fuelType,
        currentMileage,
        lastServiceDate
      });

      const savedVehicle = await vehicle.save();
      res.status(201).json(savedVehicle);
    } catch (error) {
      console.error('Error creating vehicle:', error);
      res.status(500).json({ message: 'Error creating vehicle' });
    }
  },

  /**
   * Update a vehicle
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateVehicle(req, res) {
    try {
      const {
        make,
        model,
        year,
        vin,
        licensePlate,
        registrationExpiry,
        status,
        fuelType,
        currentMileage,
        lastServiceDate
      } = req.body;

      const vehicle = await Vehicle.findByIdAndUpdate(
        req.params.id,
        {
          make,
          model,
          year,
          vin,
          licensePlate,
          registrationExpiry,
          status,
          fuelType,
          currentMileage,
          lastServiceDate
        },
        { new: true }
      );

      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      res.json(vehicle);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      res.status(500).json({ message: 'Error updating vehicle' });
    }
  },

  /**
   * Delete a vehicle
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteVehicle(req, res) {
    try {
      const { id } = req.params;
      
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Invalid vehicle ID format' 
        });
      }
      
      const collection = await VehicleModel.getCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Vehicle not found' 
        });
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Vehicle deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to delete vehicle', 
        error: error.message 
      });
    }
  },

  /**
   * Search for vehicles based on query parameters
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async searchVehicles(req, res) {
    try {
      // Build query from request parameters
      const query = {};
      
      // Handle make/model search
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query.$or = [
          { make: { $regex: searchRegex } },
          { model: { $regex: searchRegex } },
          { licensePlate: { $regex: searchRegex } }
        ];
      }
      
      // Handle status filter
      if (req.query.status) {
        query.status = req.query.status;
      }
      
      // Handle year filter
      if (req.query.year) {
        query.year = parseInt(req.query.year);
      }
      
      // Handle mileage range filter
      if (req.query.minMileage || req.query.maxMileage) {
        query.mileage = {};
        if (req.query.minMileage) query.mileage.$gte = parseInt(req.query.minMileage);
        if (req.query.maxMileage) query.mileage.$lte = parseInt(req.query.maxMileage);
      }
      
      const collection = await VehicleModel.getCollection();
      const vehicles = await collection.find(query).toArray();
      
      res.status(200).json(vehicles);
    } catch (error) {
      console.error('Error searching vehicles:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to search vehicles', 
        error: error.message 
      });
    }
  }
};

module.exports = VehicleController; 