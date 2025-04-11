const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/expenseController');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all expense routes
router.use(authenticate);

// Get all expenses
router.get('/', ExpenseController.getAllExpenses);

// Get expense summary
router.get('/summary', ExpenseController.getExpenseSummary);

// Get monthly expenses with totals
router.get('/monthly', ExpenseController.getMonthlyExpenses);

// Get yearly expenses with totals
router.get('/yearly', ExpenseController.getYearlyExpenses);

// Get fuel expenses - monthly
router.get('/fuel/monthly', ExpenseController.getMonthlyFuelExpenses);

// Get fuel expenses - yearly
router.get('/fuel/yearly', ExpenseController.getYearlyFuelExpenses);

// Get expenses by category (for pie chart)
router.get('/by-category', ExpenseController.getExpenseByCategory);

// Get expenses by vehicle
router.get('/vehicle/:vehicleId', ExpenseController.getExpensesByVehicle);

// Get expenses by driver
router.get('/driver/:driverId', ExpenseController.getExpensesByDriver);

// Get specific expense
router.get('/:id', ExpenseController.getExpenseById);

// Create new expense
router.post('/', ExpenseController.createExpense);

// Update expense
router.put('/:id', ExpenseController.updateExpense);

// Update expense status
router.patch('/:id/status', ExpenseController.updateExpenseStatus);

// Delete expense
router.delete('/:id', ExpenseController.deleteExpense);

module.exports = router; 