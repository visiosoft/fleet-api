const { ObjectId } = require('mongodb');
const db = require('../config/db');

const COLLECTION_NAME = 'vehicles';

/**
 * Vehicle schema definition (for documentation and validation)
 * In MongoDB we don't enforce this strictly, but this serves as a reference
 * 
 * {
 *   make: String,
 *   model: String,
 *   year: Number,
 *   licensePlate: String,
 *   vin: String,
 *   status: String, // Active, Maintenance, Out of Service
 *   mileage: Number,
 *   lastMaintenance: Date,
 *   nextMaintenance: Date,
 *   fuelType: String,
 *   assignedDriver: ObjectId, // Reference to driver
 *   insuranceInfo: {
 *     provider: String,
 *     policyNumber: String,
 *     expiryDate: Date
 *   },
 *   notes: String
 * }
 */

// Vehicle model 
const VehicleModel = {
  /**
   * Validate vehicle data against our expected schema
   * @param {Object} data - Vehicle data to validate
   * @returns {Object} - Validation result {isValid, errors}
   */
  validate(data) {
    const errors = [];
    
    // Required fields
    if (!data.make) errors.push('Make is required');
    if (!data.model) errors.push('Model is required');
    if (!data.year) errors.push('Year is required');
    if (!data.licensePlate) errors.push('License plate is required');
    if (!data.vin) errors.push('VIN is required');
    
    // Type validation
    if (data.year && (isNaN(data.year) || data.year < 1900 || data.year > new Date().getFullYear() + 1)) {
      errors.push('Year must be a valid year');
    }
    
    if (data.mileage && (isNaN(data.mileage) || data.mileage < 0)) {
      errors.push('Mileage must be a positive number');
    }
    
    // Date validation
    if (data.lastMaintenance && !(new Date(data.lastMaintenance) instanceof Date)) {
      errors.push('Last maintenance date must be a valid date');
    }
    
    if (data.nextMaintenance && !(new Date(data.nextMaintenance) instanceof Date)) {
      errors.push('Next maintenance date must be a valid date');
    }
    
    if (data.insuranceInfo?.expiryDate && !(new Date(data.insuranceInfo.expiryDate) instanceof Date)) {
      errors.push('Insurance expiry date must be a valid date');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  /**
   * Get MongoDB vehicle collection
   * @returns {Promise<Collection>} MongoDB collection
   */
  async getCollection() {
    return await db.getCollection(COLLECTION_NAME);
  },
  
  /**
   * Clean up vehicle data and prepare it for insertion
   * @param {Object} data - Vehicle data
   * @returns {Object} - Cleaned data
   */
  prepareData(data) {
    // Create a copy to avoid mutating the original
    const vehicle = { ...data };
    
    // Format dates if they exist and are strings
    if (vehicle.lastMaintenance && typeof vehicle.lastMaintenance === 'string') {
      vehicle.lastMaintenance = new Date(vehicle.lastMaintenance);
    }
    
    if (vehicle.nextMaintenance && typeof vehicle.nextMaintenance === 'string') {
      vehicle.nextMaintenance = new Date(vehicle.nextMaintenance);
    }
    
    if (vehicle.insuranceInfo?.expiryDate && typeof vehicle.insuranceInfo.expiryDate === 'string') {
      vehicle.insuranceInfo.expiryDate = new Date(vehicle.insuranceInfo.expiryDate);
    }
    
    // Set default values for missing fields
    if (!vehicle.status) vehicle.status = 'Active';
    if (!vehicle.mileage) vehicle.mileage = 0;
    
    return vehicle;
  }
};

module.exports = VehicleModel; 