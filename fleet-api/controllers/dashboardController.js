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
      // Get company ID from authenticated user
      const companyId = req.user.companyId;
      
      if (!companyId) {
        return res.status(400).json({
          status: 'error',
          message: 'Company ID not found in user token'
        });
      }
      
      console.log(`Fetching active counts for company ID: ${companyId}`);
      
      // Get vehicle collection
      const vehicleCollection = await db.getCollection('vehicles');
      const activeVehicles = await vehicleCollection.find({ 
        status: 'active',
        companyId: companyId.toString()
      }).toArray();

      // Get driver collection
      const driverCollection = await db.getCollection('drivers');
      const activeDrivers = await driverCollection.find({ 
        status: 'active',
        companyId: companyId.toString()
      }).toArray();

      console.log(`Found ${activeVehicles.length} active vehicles and ${activeDrivers.length} active drivers for company ${companyId}`);

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
      // Get company ID from authenticated user
      const companyId = req.user.companyId;
      
      if (!companyId) {
        return res.status(400).json({
          status: 'error',
          message: 'Company ID not found in user token'
        });
      }
      
      console.log(`Fetching active vehicles for company ID: ${companyId}`);
      
      const collection = await db.getCollection('vehicles');
      const activeVehicles = await collection.find({ 
        status: 'active',
        companyId: companyId.toString()
      }).toArray();

      console.log(`Found ${activeVehicles.length} active vehicles for company ${companyId}`);
      
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
      // Get company ID from authenticated user
      const companyId = req.user.companyId;
      
      if (!companyId) {
        return res.status(400).json({
          status: 'error',
          message: 'Company ID not found in user token'
        });
      }
      
      console.log(`Fetching active drivers for company ID: ${companyId}`);
      
      const collection = await db.getCollection('drivers');
      const activeDrivers = await collection.find({ 
        status: 'active',
        companyId: companyId.toString()
      }).toArray();

      console.log(`Found ${activeDrivers.length} active drivers for company ${companyId}`);
      
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
      // Get company ID from authenticated user
      const companyId = req.user.companyId;
      
      if (!companyId) {
        return res.status(400).json({
          status: 'error',
          message: 'Company ID not found in user token'
        });
      }
      
      console.log(`Fetching fuel costs for company ID: ${companyId}`);
      
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
            },
            companyId: companyId.toString()
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

      console.log(`Found ${result[0].totalTransactions} fuel transactions for company ${companyId}`);
      
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
      // Get company ID from authenticated user
      const companyId = req.user.companyId;
      
      if (!companyId) {
        return res.status(400).json({
          status: 'error',
          message: 'Company ID not found in user token'
        });
      }
      
      console.log(`Fetching fuel by vehicle for company ID: ${companyId}`);
      
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
            },
            companyId: companyId.toString()
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
          $match: {
            'vehicleInfo.companyId': companyId.toString()
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

      console.log(`Found ${result.length} vehicles with fuel transactions for company ${companyId}`);
      
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
      // Get company ID from authenticated user
      const companyId = req.user.companyId;
      
      if (!companyId) {
        return res.status(400).json({
          status: 'error',
          message: 'Company ID not found in user token'
        });
      }
      
      console.log(`Fetching maintenance costs for company ID: ${companyId}`);
      
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
            },
            companyId: companyId.toString()
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
      
      console.log(`Found ${result[0].totalTransactions} maintenance transactions for company ${companyId}`);

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
      // Get company ID from authenticated user
      const companyId = req.user.companyId;
      
      if (!companyId) {
        return res.status(400).json({
          status: 'error',
          message: 'Company ID not found in user token'
        });
      }
      
      console.log(`Fetching maintenance by vehicle for company ID: ${companyId}`);
      
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
            },
            companyId: companyId.toString()
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
          $match: {
            'vehicleInfo.companyId': companyId.toString()
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
      
      console.log(`Found ${result.length} vehicles with maintenance transactions for company ${companyId}`);

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
  },

  /**
   * Get contract statistics including total, active, expiring soon, and total value
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getContractStats(req, res) {
    try {
      // Get company ID from authenticated user
      const companyId = req.user.companyId;
      
      if (!companyId) {
        return res.status(400).json({
          status: 'error',
          message: 'Company ID not found in user token'
        });
      }
      
      console.log(`Fetching contract stats for company ID: ${companyId}`);
      
      const collection = await db.getCollection('contracts');
      const now = new Date();
      
      // Define expiring soon threshold (7 days from now)
      const expiringSoonDate = new Date();
      expiringSoonDate.setDate(expiringSoonDate.getDate() + 7);

      // First, let's get all contracts to debug
      const allContracts = await collection.find({
        companyId: companyId.toString()
      }).toArray();
      
      console.log('Total contracts found:', allContracts.length);
      console.log('Current date:', now);

      // Validate and convert contract dates
      const validContracts = allContracts.map(contract => {
        const endDate = new Date(contract.endDate);
        const startDate = new Date(contract.startDate);
        return {
          ...contract,
          endDate,
          startDate,
          isActive: endDate > now && (!contract.status || contract.status !== 'terminated'),
          isExpiringSoon: endDate > now && endDate <= expiringSoonDate && (!contract.status || contract.status !== 'terminated')
        };
      });

      const pipeline = [
        {
          $match: {
            companyId: companyId.toString()
          }
        },
        {
          $addFields: {
            // Convert string dates to Date objects if they aren't already
            endDate: { $toDate: '$endDate' },
            startDate: { $toDate: '$startDate' }
          }
        },
        {
          $facet: {
            // Total contracts count
            totalContracts: [
              { $count: 'count' }
            ],
            // Active contracts (end date > current date)
            activeContracts: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $gt: ['$endDate', now] },
                      { $or: [
                        { $eq: ['$status', null] },
                        { $ne: ['$status', 'terminated'] }
                      ]}
                    ]
                  }
                }
              },
              { $count: 'count' }
            ],
            // Contracts expiring in next 7 days
            expiringSoon: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $gt: ['$endDate', now] },
                      { $lte: ['$endDate', expiringSoonDate] },
                      { $or: [
                        { $eq: ['$status', null] },
                        { $ne: ['$status', 'terminated'] }
                      ]}
                    ]
                  }
                }
              },
              { $count: 'count' }
            ],
            // Total contract value (sum of all contract values)
            totalValue: [
              {
                $group: {
                  _id: null,
                  value: { $sum: '$value' }
                }
              }
            ],
            // Recent contracts for reference
            recentContracts: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $gt: ['$endDate', now] },
                      { $or: [
                        { $eq: ['$status', null] },
                        { $ne: ['$status', 'terminated'] }
                      ]}
                    ]
                  }
                }
              },
              {
                $sort: { startDate: -1 }
              },
              {
                $limit: 5
              },
              {
                $project: {
                  contractNumber: 1,
                  value: 1,
                  startDate: 1,
                  endDate: 1,
                  status: 1,
                  clientName: 1
                }
              }
            ]
          }
        }
      ];

      const result = await collection.aggregate(pipeline).toArray();
      const stats = result[0];

      // Manual count for verification
      const manualCounts = {
        active: validContracts.filter(c => c.isActive).length,
        expiringSoon: validContracts.filter(c => c.isExpiringSoon).length,
        totalValue: validContracts.reduce((sum, c) => sum + (Number(c.value) || 0), 0)
      };

      // Debug contract values
      console.log('Contract values:', validContracts.map(c => ({
        id: c._id,
        value: c.value,
        parsed: Number(c.value)
      })));

      console.log(`Found ${allContracts.length} total contracts, ${manualCounts.active} active, ${manualCounts.expiringSoon} expiring soon for company ${companyId}`);
      
      res.status(200).json({
        status: 'success',
        data: {
          totalContracts: stats.totalContracts[0]?.count || 0,
          activeContracts: manualCounts.active,
          expiringSoon: manualCounts.expiringSoon,
          totalValue: manualCounts.totalValue, // Using manual calculation for more reliable results
          recentContracts: stats.recentContracts || [],
          lastUpdated: now,
          debug: {
            totalFound: allContracts.length,
            contractsWithFutureEndDate: validContracts.filter(c => c.endDate > now).length,
            currentDate: now,
            manualCounts,
            aggregateCounts: {
              active: stats.activeContracts[0]?.count || 0,
              expiringSoon: stats.expiringSoon[0]?.count || 0,
              totalValue: stats.totalValue[0]?.value || 0
            }
          }
        }
      });
    } catch (error) {
      console.error('Error getting contract statistics:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to retrieve contract statistics', 
        error: error.message 
      });
    }
  }
};

module.exports = DashboardController; 