const { ObjectId } = require('mongodb');
const ExpenseModel = require('../models/expenseModel');

/**
 * Expense Controller - Handles business logic for expense operations
 */
const ExpenseController = {
  /**
   * Get all expenses
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllExpenses(req, res) {
    try {
      const collection = await ExpenseModel.getCollection();
      const expenses = await collection.find({}).sort({ date: -1 }).toArray();
      
      res.status(200).json(expenses);
    } catch (error) {
      console.error('Error getting all expenses:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to retrieve expenses', 
        error: error.message 
      });
    }
  },

  /**
   * Get an expense by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getExpenseById(req, res) {
    try {
      const { id } = req.params;
      
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Invalid expense ID format' 
        });
      }
      
      const collection = await ExpenseModel.getCollection();
      const expense = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!expense) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Expense not found' 
        });
      }
      
      res.status(200).json(expense);
    } catch (error) {
      console.error(`Error getting expense by ID:`, error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to retrieve expense', 
        error: error.message 
      });
    }
  },

  /**
   * Create a new expense
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createExpense(req, res) {
    try {
      const expenseData = req.body;
      
      // Validate expense data
      const validation = ExpenseModel.validate(expenseData);
      if (!validation.isValid) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Invalid expense data', 
          errors: validation.errors 
        });
      }
      
      // Prepare data for insertion
      const preparedData = ExpenseModel.prepareData(expenseData);
      
      const collection = await ExpenseModel.getCollection();
      const result = await collection.insertOne(preparedData);
      
      res.status(201).json({
        status: 'success',
        message: 'Expense created successfully',
        _id: result.insertedId,
        expense: { _id: result.insertedId, ...preparedData }
      });
    } catch (error) {
      console.error('Error creating expense:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to create expense', 
        error: error.message 
      });
    }
  },

  /**
   * Update an expense
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateExpense(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Invalid expense ID format' 
        });
      }
      
      // Check if expense exists
      const collection = await ExpenseModel.getCollection();
      const existingExpense = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!existingExpense) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Expense not found' 
        });
      }
      
      // Only allow updates if status is pending
      if (existingExpense.paymentStatus !== 'pending') {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Cannot update expense that is not in pending status' 
        });
      }
      
      // Prepare data for update
      const preparedData = ExpenseModel.prepareData({
        ...existingExpense,
        ...updateData,
        updatedAt: new Date()
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
          message: 'No changes were made to the expense' 
        });
      }
      
      // Get the updated expense
      const updatedExpense = await collection.findOne({ _id: new ObjectId(id) });
      
      res.status(200).json({
        status: 'success',
        message: 'Expense updated successfully',
        expense: updatedExpense
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to update expense', 
        error: error.message 
      });
    }
  },

  /**
   * Update expense payment status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateExpenseStatus(req, res) {
    try {
      const { id } = req.params;
      const { paymentStatus } = req.body;
      
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Invalid expense ID format' 
        });
      }
      
      // Validate status
      const validStatuses = ['pending', 'approved', 'rejected', 'paid'];
      if (!validStatuses.includes(paymentStatus)) {
        return res.status(400).json({ 
          status: 'error', 
          message: `Payment status must be one of: ${validStatuses.join(', ')}` 
        });
      }
      
      const collection = await ExpenseModel.getCollection();
      const existingExpense = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!existingExpense) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Expense not found' 
        });
      }
      
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            paymentStatus: paymentStatus,
            updatedAt: new Date()
          } 
        }
      );
      
      if (result.modifiedCount === 0) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'No changes were made to the expense status' 
        });
      }
      
      // Get the updated expense
      const updatedExpense = await collection.findOne({ _id: new ObjectId(id) });
      
      res.status(200).json({
        status: 'success',
        message: 'Expense status updated successfully',
        expense: updatedExpense
      });
    } catch (error) {
      console.error('Error updating expense status:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to update expense status', 
        error: error.message 
      });
    }
  },

  /**
   * Delete an expense
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteExpense(req, res) {
    try {
      const { id } = req.params;
      
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Invalid expense ID format' 
        });
      }
      
      const collection = await ExpenseModel.getCollection();
      const expense = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!expense) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Expense not found' 
        });
      }
      
      
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Expense not found' 
        });
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Expense deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to delete expense', 
        error: error.message 
      });
    }
  },

  /**
   * Get expenses by vehicle
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getExpensesByVehicle(req, res) {
    try {
      const { vehicleId } = req.params;
      
      const collection = await ExpenseModel.getCollection();
      const expenses = await collection.find({ vehicleId }).sort({ date: -1 }).toArray();
      
      res.status(200).json(expenses);
    } catch (error) {
      console.error('Error getting expenses by vehicle:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to retrieve expenses', 
        error: error.message 
      });
    }
  },

  /**
   * Get expenses by driver
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getExpensesByDriver(req, res) {
    try {
      const { driverId } = req.params;
      
      const collection = await ExpenseModel.getCollection();
      const expenses = await collection.find({ driverId }).sort({ date: -1 }).toArray();
      
      res.status(200).json(expenses);
    } catch (error) {
      console.error('Error getting expenses by driver:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to retrieve expenses', 
        error: error.message 
      });
    }
  },

  /**
   * Get expense summary
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getExpenseSummary(req, res) {
    try {
      const { startDate, endDate, groupBy = 'expenseType' } = req.query;
      
      // Build date filter if provided
      const matchStage = {};
      if (startDate || endDate) {
        matchStage.date = {};
        if (startDate) matchStage.date.$gte = new Date(startDate);
        if (endDate) matchStage.date.$lte = new Date(endDate);
      }
      
      const collection = await ExpenseModel.getCollection();
      
      // Valid grouping fields
      const validGroupFields = ['expenseType', 'paymentStatus', 'paymentMethod', 'vehicleId', 'driverId'];
      if (!validGroupFields.includes(groupBy)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid groupBy parameter. Must be one of: ${validGroupFields.join(', ')}`
        });
      }
      
      // Get summary grouped by the specified field
      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: `$${groupBy}`,
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { totalAmount: -1 } }
      ];
      
      const summary = await collection.aggregate(pipeline).toArray();
      
      // Calculate grand total
      const grandTotal = summary.reduce((total, item) => total + item.totalAmount, 0);
      
      res.status(200).json({
        status: 'success',
        data: {
          summary,
          grandTotal,
          totalCount: summary.reduce((count, item) => count + item.count, 0)
        }
      });
    } catch (error) {
      console.error('Error getting expense summary:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to retrieve expense summary', 
        error: error.message 
      });
    }
  },

  /**
   * Get monthly expense totals
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getMonthlyExpenses(req, res) {
    try {
      const { year } = req.query;
      const collection = await ExpenseModel.getCollection();
      
      const pipeline = [
        {
          $match: {
            date: {
              $gte: new Date(year || new Date().getFullYear(), 0, 1),
              $lt: new Date((year || new Date().getFullYear()) + 1, 0, 1)
            }
          }
        },
        {
          $group: {
            _id: {
              month: { $month: '$date' },
              year: { $year: '$date' }
            },
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            month: '$_id.month',
            year: '$_id.year',
            totalAmount: 1,
            count: 1
          }
        },
        { $sort: { month: 1 } }
      ];

      const monthlyExpenses = await collection.aggregate(pipeline).toArray();
      
      // Calculate yearly total
      const yearlyTotal = monthlyExpenses.reduce((total, month) => total + month.totalAmount, 0);
      
      res.status(200).json({
        status: 'success',
        data: {
          monthlyExpenses,
          yearlyTotal
        }
      });
    } catch (error) {
      console.error('Error getting monthly expenses:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to retrieve monthly expenses', 
        error: error.message 
      });
    }
  },

  /**
   * Get yearly expense totals
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getYearlyExpenses(req, res) {
    try {
      const collection = await ExpenseModel.getCollection();
      
      const pipeline = [
        {
          $group: {
            _id: { $year: '$date' },
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            year: '$_id',
            totalAmount: 1,
            count: 1
          }
        },
        { $sort: { year: -1 } }
      ];

      const yearlyExpenses = await collection.aggregate(pipeline).toArray();
      
      // Calculate grand total
      const grandTotal = yearlyExpenses.reduce((total, year) => total + year.totalAmount, 0);
      
      res.status(200).json({
        status: 'success',
        data: {
          yearlyExpenses,
          grandTotal
        }
      });
    } catch (error) {
      console.error('Error getting yearly expenses:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to retrieve yearly expenses', 
        error: error.message 
      });
    }
  },

  /**
   * Get expense breakdown by category (for pie chart)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getExpenseByCategory(req, res) {
    try {
      const { year } = req.query;
      const collection = await ExpenseModel.getCollection();
      
      const pipeline = [
        {
          $match: year ? {
            date: {
              $gte: new Date(year, 0, 1),
              $lt: new Date(parseInt(year) + 1, 0, 1)
            }
          } : {}
        },
        {
          $group: {
            _id: '$expenseType',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            category: '$_id',
            totalAmount: 1,
            count: 1,
            percentage: {
              $multiply: [
                { $divide: ['$totalAmount', { $sum: '$totalAmount' }] },
                100
              ]
            }
          }
        },
        { $sort: { totalAmount: -1 } }
      ];

      const categoryExpenses = await collection.aggregate(pipeline).toArray();
      
      // Calculate total
      const total = categoryExpenses.reduce((sum, category) => sum + category.totalAmount, 0);
      
      res.status(200).json({
        status: 'success',
        data: {
          categories: categoryExpenses,
          total
        }
      });
    } catch (error) {
      console.error('Error getting expenses by category:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to retrieve expenses by category', 
        error: error.message 
      });
    }
  },

  /**
   * Get monthly fuel expenses
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getMonthlyFuelExpenses(req, res) {
    try {
      const { year } = req.query;
      const collection = await ExpenseModel.getCollection();
      
      const pipeline = [
        {
          $match: {
            expenseType: 'fuel',
            date: {
              $gte: new Date(year || new Date().getFullYear(), 0, 1),
              $lt: new Date((year || new Date().getFullYear()) + 1, 0, 1)
            }
          }
        },
        {
          $group: {
            _id: {
              month: { $month: '$date' },
              year: { $year: '$date' }
            },
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            month: '$_id.month',
            year: '$_id.year',
            totalAmount: 1,
            count: 1
          }
        },
        { $sort: { month: 1 } }
      ];

      const monthlyFuelExpenses = await collection.aggregate(pipeline).toArray();
      
      // Calculate yearly fuel total
      const yearlyFuelTotal = monthlyFuelExpenses.reduce((total, month) => total + month.totalAmount, 0);
      
      res.status(200).json({
        status: 'success',
        data: {
          monthlyFuelExpenses,
          yearlyFuelTotal
        }
      });
    } catch (error) {
      console.error('Error getting monthly fuel expenses:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to retrieve monthly fuel expenses', 
        error: error.message 
      });
    }
  },

  /**
   * Get yearly fuel expenses
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getYearlyFuelExpenses(req, res) {
    try {
      const collection = await ExpenseModel.getCollection();
      
      const pipeline = [
        {
          $match: {
            expenseType: 'fuel'
          }
        },
        {
          $group: {
            _id: { $year: '$date' },
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            year: '$_id',
            totalAmount: 1,
            count: 1
          }
        },
        { $sort: { year: -1 } }
      ];

      const yearlyFuelExpenses = await collection.aggregate(pipeline).toArray();
      
      // Calculate grand total for fuel
      const grandFuelTotal = yearlyFuelExpenses.reduce((total, year) => total + year.totalAmount, 0);
      
      res.status(200).json({
        status: 'success',
        data: {
          yearlyFuelExpenses,
          grandFuelTotal
        }
      });
    } catch (error) {
      console.error('Error getting yearly fuel expenses:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to retrieve yearly fuel expenses', 
        error: error.message 
      });
    }
  }
};

module.exports = ExpenseController; 