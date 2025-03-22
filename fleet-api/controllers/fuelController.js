const { ObjectId } = require('mongodb');
const FuelModel = require('../models/fuelModel');

/**
 * Fuel Controller - Handles business logic for fuel record operations
 */
const FuelController = {
  /**
   * Get all fuel records
   */
  async getAllFuelRecords(req, res) {
    try {
      const collection = await FuelModel.getCollection();
      const fuelRecords = await collection.find({}).toArray();
      
      res.status(200).json(fuelRecords);
    } catch (error) {
      console.error('Error getting all fuel records:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to retrieve fuel records', 
        error: error.message 
      });
    }
  },

  /**
   * Get a fuel record by ID
   */
  async getFuelRecordById(req, res) {
    try {
      const { id } = req.params;
      
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Invalid fuel record ID format' 
        });
      }
      
      const collection = await FuelModel.getCollection();
      const fuelRecord = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!fuelRecord) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Fuel record not found' 
        });
      }
      
      res.status(200).json(fuelRecord);
    } catch (error) {
      console.error('Error getting fuel record by ID:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to retrieve fuel record', 
        error: error.message 
      });
    }
  },

  /**
   * Create a new fuel record
   */
  async createFuelRecord(req, res) {
    try {
      const fuelData = req.body;
      
      // Validate fuel record data
      const validation = FuelModel.validate(fuelData);
      if (!validation.isValid) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Invalid fuel record data', 
          errors: validation.errors 
        });
      }
      
      // Prepare data for insertion
      const preparedData = FuelModel.prepareData(fuelData);
      
      const collection = await FuelModel.getCollection();
      const result = await collection.insertOne(preparedData);
      
      res.status(201).json({
        status: 'success',
        message: 'Fuel record created successfully',
        _id: result.insertedId,
        fuelRecord: { _id: result.insertedId, ...preparedData }
      });
    } catch (error) {
      console.error('Error creating fuel record:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to create fuel record', 
        error: error.message 
      });
    }
  },

  /**
   * Update a fuel record
   */
  async updateFuelRecord(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Invalid fuel record ID format' 
        });
      }
      
      // Check if fuel record exists
      const collection = await FuelModel.getCollection();
      const existingRecord = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!existingRecord) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Fuel record not found' 
        });
      }
      
      // Prepare data for update
      const preparedData = FuelModel.prepareData({
        ...existingRecord,
        ...updateData
      });
      
      // Remove _id field from update data
      delete preparedData._id;
      
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: preparedData }
      );
      
      if (result.modifiedCount === 0) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'No changes were made to the fuel record' 
        });
      }
      
      // Get the updated record
      const updatedRecord = await collection.findOne({ _id: new ObjectId(id) });
      
      res.status(200).json({
        status: 'success',
        message: 'Fuel record updated successfully',
        fuelRecord: updatedRecord
      });
    } catch (error) {
      console.error('Error updating fuel record:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to update fuel record', 
        error: error.message 
      });
    }
  },

  /**
   * Delete a fuel record
   */
  async deleteFuelRecord(req, res) {
    try {
      const { id } = req.params;
      
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Invalid fuel record ID format' 
        });
      }
      
      const collection = await FuelModel.getCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Fuel record not found' 
        });
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Fuel record deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting fuel record:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to delete fuel record', 
        error: error.message 
      });
    }
  },

  /**
   * Get fuel records for a specific vehicle
   */
  async getFuelRecordsByVehicle(req, res) {
    try {
      const { vehicleId } = req.params;
      
      if (!ObjectId.isValid(vehicleId)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Invalid vehicle ID format' 
        });
      }
      
      const collection = await FuelModel.getCollection();
      const fuelRecords = await collection
        .find({ vehicleId: new ObjectId(vehicleId) })
        .sort({ date: -1 })
        .toArray();
      
      res.status(200).json(fuelRecords);
    } catch (error) {
      console.error('Error getting fuel records by vehicle:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to retrieve fuel records', 
        error: error.message 
      });
    }
  },

  /**
   * Get fuel consumption statistics
   */
  async getFuelConsumptionStats(req, res) {
    try {
      const collection = await FuelModel.getCollection();
      
      // Get date range from query params or default to last 30 days
      const endDate = new Date();
      const startDate = new Date(req.query.startDate || endDate.setDate(endDate.getDate() - 30));
      
      // Aggregate fuel consumption stats
      const stats = await collection.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: new Date() }
          }
        },
        {
          $group: {
            _id: '$vehicleId',
            totalFuelAmount: { $sum: '$amount' },
            totalCost: { $sum: '$cost' },
            avgFuelEfficiency: { $avg: '$fuelEfficiency' },
            fuelUps: { $count: {} }
          }
        }
      ]).toArray();
      
      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      console.error('Error getting fuel consumption stats:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to retrieve fuel consumption statistics', 
        error: error.message 
      });
    }
  }
};

module.exports = FuelController; 