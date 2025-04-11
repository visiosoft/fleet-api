const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all payroll routes
router.use(authenticate);

// Test route to create a driver
router.post('/test-driver', payrollController.createTestDriver);

// Get all drivers for dropdown
router.get('/drivers', payrollController.getDrivers);

// Get all payroll entries
router.get('/entries', payrollController.getAllPayrollEntries);

// Get payroll summary
router.get('/summary', payrollController.getPayrollSummary);

// Get a single payroll entry
router.get('/entries/:id', payrollController.getPayrollEntry);

// Create a new payroll entry
router.post('/entries', payrollController.createPayrollEntry);

// Update a payroll entry
router.put('/entries/:id', payrollController.updatePayrollEntry);

// Delete a payroll entry
router.delete('/entries/:id', payrollController.deletePayrollEntry);

// Export payroll data
router.get('/export', payrollController.exportPayroll);

module.exports = router; 