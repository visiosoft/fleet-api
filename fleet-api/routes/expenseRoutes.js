const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/expenseController');

// Get all expenses
router.get('/', ExpenseController.getAllExpenses);

// Get expense summary
router.get('/summary', ExpenseController.getExpenseSummary);

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