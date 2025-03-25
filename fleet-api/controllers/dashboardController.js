const { ObjectId } = require('mongodb');
const db = require('../config/db');

const DashboardController = {
  /**
   * Get total counts of active vehicles and drivers
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getActiveCounts(req, res) {
    try {
      // Get vehicle collection
      const vehicleCollection = await db.getCollection('vehicles');
      const activeVehicles = await vehicleCollection.find({ 
        status: 'active' 
      }).toArray();

      // Get driver collection
      const driverCollection = await db.getCollection('drivers');
      const activeDrivers = await driverCollection.find({ 
        status: 'active' 
      }).toArray();

      res.status(200).json({
        status: 'success',
        data: {
          totalActiveVehicles: activeVehicles.length,
          totalActiveDrivers: activeDrivers.length,
          activeVehicles: activeVehicles,
          activeDrivers: activeDrivers
        }
      });
    } catch (error) {
      console.error('Error getting active counts:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to retrieve active counts', 
        error: error.message 
      });
    }
  },

  /**
   * Get total active vehicles count and details
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getActiveVehicles(req, res) {
    try {
      const collection = await db.getCollection('vehicles');
      const activeVehicles = await collection.find({ 
        status: 'active' 
      }).toArray();

      res.status(200).json({
        status: 'success',
        data: {
          totalActiveVehicles: activeVehicles.length,
          vehicles: activeVehicles
        }
      });
    } catch (error) {
      console.error('Error getting active vehicles:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to retrieve active vehicles', 
        error: error.message 
      });
    }
  },

  /**
   * Get total active drivers count and details
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getActiveDrivers(req, res) {
    try {
      const collection = await db.getCollection('drivers');
      const activeDrivers = await collection.find({ 
        status: 'active' 
      }).toArray();

      res.status(200).json({
        status: 'success',
        data: {
          totalActiveDrivers: activeDrivers.length,
          drivers: activeDrivers
        }
      });
    } catch (error) {
      console.error('Error getting active drivers:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to retrieve active drivers', 
        error: error.message 
      });
    }
  },

  /**
   * Get current month's fuel consumption cost
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCurrentMonthFuelCost(req, res) {
    try {
      const collection = await db.getCollection('expenses');
      
      // Get current month's start and end dates
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const pipeline = [
        {
          $match: {
            expenseType: 'fuel',
            date: {
              $gte: startOfMonth,
              $lte: endOfMonth
            }
          }
        },
        {
          $group: {
            _id: null,
            totalCost: { $sum: '$amount' },
            totalTransactions: { $sum: 1 },
            fuelExpenses: { $push: '$$ROOT' }
          }
        },
        {
          $project: {
            _id: 0,
            totalCost: 1,
            totalTransactions: 1,
            fuelExpenses: 1,
            month: { $month: startOfMonth },
            year: { $year: startOfMonth }
          }
        }
      ];

      const result = await collection.aggregate(pipeline).toArray();
      
      // If no fuel expenses found for current month
      if (result.length === 0) {
        return res.status(200).json({
          status: 'success',
          data: {
            totalCost: 0,
            totalTransactions: 0,
            fuelExpenses: [],
            month: now.getMonth() + 1,
            year: now.getFullYear()
          }
        });
      }

      res.status(200).json({
        status: 'success',
        data: result[0]
      });
    } catch (error) {
      console.error('Error getting current month fuel cost:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to retrieve current month fuel cost', 
        error: error.message 
      });
    }
  },

  /**
   * Get fuel consumption statistics by vehicle for current month
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCurrentMonthFuelByVehicle(req, res) {
    try {
      const collection = await db.getCollection('expenses');
      
      // Get current month's start and end dates
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const pipeline = [
        {
          $match: {
            expenseType: 'fuel',
            date: {
              $gte: startOfMonth,
              $lte: endOfMonth
            }
          }
        },
        {
          $group: {
            _id: '$vehicleId',
            totalCost: { $sum: '$amount' },
            totalTransactions: { $sum: 1 },
            fuelExpenses: { $push: '$$ROOT' }
          }
        },
        {
          $lookup: {
            from: 'vehicles',
            localField: '_id',
            foreignField: '_id',
            as: 'vehicleInfo'
          }
        },
        {
          $project: {
            _id: 1,
            totalCost: 1,
            totalTransactions: 1,
            fuelExpenses: 1,
            vehicleInfo: { $arrayElemAt: ['$vehicleInfo', 0] },
            month: { $month: startOfMonth },
            year: { $year: startOfMonth }
          }
        },
        {
          $sort: { totalCost: -1 }
        }
      ];

      const result = await collection.aggregate(pipeline).toArray();

      res.status(200).json({
        status: 'success',
        data: {
          vehicles: result,
          totalVehicles: result.length,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          grandTotal: result.reduce((sum, vehicle) => sum + vehicle.totalCost, 0)
        }
      });
    } catch (error) {
      console.error('Error getting current month fuel by vehicle:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to retrieve current month fuel by vehicle', 
        error: error.message 
      });
    }
  },

  /**
   * Get current month's maintenance cost
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCurrentMonthMaintenanceCost(req, res) {
    try {
      const collection = await db.getCollection('expenses');
      
      // Get current month's start and end dates
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const pipeline = [
        {
          $match: {
            expenseType: 'maintenance',
            date: {
              $gte: startOfMonth,
              $lte: endOfMonth
            }
          }
        },
        {
          $group: {
            _id: null,
            totalCost: { $sum: '$amount' },
            totalTransactions: { $sum: 1 },
            maintenanceExpenses: { $push: '$$ROOT' }
          }
        },
        {
          $project: {
            _id: 0,
            totalCost: 1,
            totalTransactions: 1,
            maintenanceExpenses: 1,
            month: { $month: startOfMonth },
            year: { $year: startOfMonth }
          }
        }
      ];

      const result = await collection.aggregate(pipeline).toArray();
      
      // If no maintenance expenses found for current month
      if (result.length === 0) {
        return res.status(200).json({
          status: 'success',
          data: {
            totalCost: 0,
            totalTransactions: 0,
            maintenanceExpenses: [],
            month: now.getMonth() + 1,
            year: now.getFullYear()
          }
        });
      }

      res.status(200).json({
        status: 'success',
        data: result[0]
      });
    } catch (error) {
      console.error('Error getting current month maintenance cost:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to retrieve current month maintenance cost', 
        error: error.message 
      });
    }
  },

  /**
   * Get maintenance cost statistics by vehicle for current month
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCurrentMonthMaintenanceByVehicle(req, res) {
    try {
      const collection = await db.getCollection('expenses');
      
      // Get current month's start and end dates
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const pipeline = [
        {
          $match: {
            expenseType: 'maintenance',
            date: {
              $gte: startOfMonth,
              $lte: endOfMonth
            }
          }
        },
        {
          $group: {
            _id: '$vehicleId',
            totalCost: { $sum: '$amount' },
            totalTransactions: { $sum: 1 },
            maintenanceExpenses: { $push: '$$ROOT' }
          }
        },
        {
          $lookup: {
            from: 'vehicles',
            localField: '_id',
            foreignField: '_id',
            as: 'vehicleInfo'
          }
        },
        {
          $project: {
            _id: 1,
            totalCost: 1,
            totalTransactions: 1,
            maintenanceExpenses: 1,
            vehicleInfo: { $arrayElemAt: ['$vehicleInfo', 0] },
            month: { $month: startOfMonth },
            year: { $year: startOfMonth }
          }
        },
        {
          $sort: { totalCost: -1 }
        }
      ];

      const result = await collection.aggregate(pipeline).toArray();

      res.status(200).json({
        status: 'success',
        data: {
          vehicles: result,
          totalVehicles: result.length,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          grandTotal: result.reduce((sum, vehicle) => sum + vehicle.totalCost, 0)
        }
      });
    } catch (error) {
      console.error('Error getting current month maintenance by vehicle:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to retrieve current month maintenance by vehicle', 
        error: error.message 
      });
    }
  }
};

module.exports = DashboardController; 