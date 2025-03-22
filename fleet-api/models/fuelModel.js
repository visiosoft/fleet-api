const { getDB } = require('../config/database');

const FuelModel = {
  /**
   * Get the fuel records collection
   */
  async getCollection() {
    const db = await getDB();
    return db.collection('fuelRecords');
  },

  /**
   * Validate fuel record data
   */
  validate(data) {
    const errors = [];

    // Required fields
    const requiredFields = [
      'vehicleId',
      'date',
      'amount',
      'cost',
      'odometer',
      'fuelType'
    ];

    requiredFields.forEach(field => {
      if (!data[field]) {
        errors.push(`${field} is required`);
      }
    });

    // Numeric validations
    if (data.amount && isNaN(parseFloat(data.amount))) {
      errors.push('amount must be a number');
    }

    if (data.cost && isNaN(parseFloat(data.cost))) {
      errors.push('cost must be a number');
    }

    if (data.odometer && isNaN(parseInt(data.odometer))) {
      errors.push('odometer must be a number');
    }

    // Date validation
    if (data.date && isNaN(new Date(data.date).getTime())) {
      errors.push('date must be a valid date');
    }

    // Fuel type validation
    const validFuelTypes = ['gasoline', 'diesel', 'electric', 'hybrid'];
    if (data.fuelType && !validFuelTypes.includes(data.fuelType)) {
      errors.push('invalid fuel type');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Prepare fuel record data for database operations
   */
  prepareData(data) {
    const { ObjectId } = require('mongodb');
    
    return {
      vehicleId: data.vehicleId ? new ObjectId(data.vehicleId) : null,
      date: new Date(data.date),
      amount: parseFloat(data.amount),
      cost: parseFloat(data.cost),
      odometer: parseInt(data.odometer),
      fuelType: data.fuelType,
      fuelEfficiency: data.amount && data.odometer ? 
        parseFloat((data.odometer / data.amount).toFixed(2)) : null,
      notes: data.notes || '',
      location: data.location || '',
      createdAt: data.createdAt || new Date(),
      updatedAt: new Date()
    };
  },

  /**
   * Create indexes for the collection
   */
  async createIndexes() {
    const collection = await this.getCollection();
    await collection.createIndex({ vehicleId: 1 });
    await collection.createIndex({ date: -1 });
    await collection.createIndex({ fuelType: 1 });
  }
};

module.exports = FuelModel; 