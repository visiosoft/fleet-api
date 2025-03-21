const { ObjectId } = require('mongodb');
const db = require('../config/db');

const COLLECTION_NAME = 'drivers';

/**
 * Driver schema definition (for documentation and validation)
 * In MongoDB we don't enforce this strictly, but this serves as a reference
 * 
 * {
 *   firstName: String,
 *   lastName: String, 
 *   licenseNumber: String,
 *   licenseExpiry: Date,
 *   contact: {
 *     phone: String,
 *     email: String,
 *     address: String
 *   },
 *   status: String, // Active, Inactive, On Leave, Terminated
 *   rating: Number, // 1-5 star rating
 *   assignedVehicle: ObjectId, // Reference to vehicle
 *   hireDate: Date,
 *   employeeId: String,
 *   certifications: [String],
 *   notes: String,
 *   emergencyContact: {
 *     name: String,
 *     relationship: String,
 *     phone: String
 *   }
 * }
 */

// Driver model 
const DriverModel = {
  /**
   * Validate driver data against our expected schema
   * @param {Object} data - Driver data to validate
   * @returns {Object} - Validation result {isValid, errors}
   */
  validate(data) {
    const errors = [];
    
    // Required fields
    if (!data.firstName) errors.push('First name is required');
    if (!data.lastName) errors.push('Last name is required');
    if (!data.licenseNumber) errors.push('License number is required');
    
    // Type validation
    if (data.licenseExpiry && !(new Date(data.licenseExpiry) instanceof Date)) {
      errors.push('License expiry must be a valid date');
    }
    
    if (data.rating && (isNaN(data.rating) || data.rating < 1 || data.rating > 5)) {
      errors.push('Rating must be a number between 1 and 5');
    }
    
    if (data.hireDate && !(new Date(data.hireDate) instanceof Date)) {
      errors.push('Hire date must be a valid date');
    }
    
    // Contact validation
    if (data.contact) {
      if (data.contact.email && !/^\S+@\S+\.\S+$/.test(data.contact.email)) {
        errors.push('Email must be valid');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  /**
   * Get MongoDB driver collection
   * @returns {Promise<Collection>} MongoDB collection
   */
  async getCollection() {
    return await db.getCollection(COLLECTION_NAME);
  },
  
  /**
   * Clean up driver data and prepare it for insertion
   * @param {Object} data - Driver data
   * @returns {Object} - Cleaned data
   */
  prepareData(data) {
    // Create a copy to avoid mutating the original
    const driver = { ...data };
    
    // Format dates if they exist and are strings
    if (driver.licenseExpiry && typeof driver.licenseExpiry === 'string') {
      driver.licenseExpiry = new Date(driver.licenseExpiry);
    }
    
    if (driver.hireDate && typeof driver.hireDate === 'string') {
      driver.hireDate = new Date(driver.hireDate);
    }
    
    // Set default values for missing fields
    if (!driver.status) driver.status = 'Active';
    if (!driver.rating) driver.rating = 3;
    
    return driver;
  }
};

module.exports = DriverModel; 