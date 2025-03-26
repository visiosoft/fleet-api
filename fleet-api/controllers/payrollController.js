const PayrollEntry = require('../models/PayrollEntry');
const Driver = require('../models/Driver');
const ExcelJS = require('exceljs');
const { ObjectId } = require('mongodb');
const db = require('../config/db');

// Get all payroll entries
exports.getAllPayrollEntries = async (req, res) => {
  try {
    const cursor = await PayrollEntry.find();
    const payrollEntries = await cursor.toArray();

    res.json({
      status: 'success',
      data: payrollEntries
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch payroll entries',
      error: error.message
    });
  }
};

// Get a single payroll entry
exports.getPayrollEntry = async (req, res) => {
  try {
    const payrollEntry = await PayrollEntry.findById(req.params.id);

    if (!payrollEntry) {
      return res.status(404).json({
        status: 'error',
        message: 'Payroll entry not found'
      });
    }

    res.json({
      status: 'success',
      data: payrollEntry
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch payroll entry',
      error: error.message
    });
  }
};

// Create a new payroll entry
exports.createPayrollEntry = async (req, res) => {
  try {
    console.log('Creating payroll entry with data:', req.body); // Debug log

    // Check for duplicate entry
    const existingEntry = await PayrollEntry.findOne({
      driverName: req.body.driverName,
      month: req.body.month.split('-')[1], // Extract month from YYYY-MM format
      year: parseInt(req.body.month.split('-')[0]) // Extract year from YYYY-MM format
    });

    console.log('Checking for existing entry:', existingEntry); // Debug log

    if (existingEntry) {
      return res.status(400).json({
        status: 'error',
        message: 'Payroll entry already exists for this driver and month',
        data: null
      });
    }

    // Create payroll entry
    console.log('Creating new PayrollEntry instance'); // Debug log
    const payrollEntry = new PayrollEntry(req.body);
    console.log('PayrollEntry instance created:', payrollEntry); // Debug log

    console.log('Attempting to save payroll entry'); // Debug log
    await payrollEntry.save();
    console.log('Payroll entry saved successfully'); // Debug log

    res.status(201).json({
      status: 'success',
      data: payrollEntry
    });
  } catch (error) {
    console.error('Error creating payroll entry:', error); // Debug log
    console.error('Error stack:', error.stack); // Debug log
    res.status(500).json({
      status: 'error',
      message: 'Failed to create payroll entry',
      error: error.message,
      data: null
    });
  }
};

// Update a payroll entry
exports.updatePayrollEntry = async (req, res) => {
  try {
    const id = req.params.id;
    console.log('Updating payroll entry with ID:', id);
    console.log('Update data:', req.body);

    // Get the collection
    const collection = await db.getCollection('payrollentries');

    // Find the existing entry
    const existingEntry = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingEntry) {
      return res.status(404).json({
        status: 'error',
        message: 'Payroll entry not found',
        data: null
      });
    }

    // Create updated entry with new data
    const updatedEntry = {
      ...existingEntry,
      ...req.body,
      _id: new ObjectId(id), // Preserve the original ID
      updatedAt: new Date()
    };

    // If status is being updated to 'paid', set paymentDate
    if (req.body.status === 'paid') {
      updatedEntry.paymentDate = new Date();
    }

    // Update the entry
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedEntry }
    );

    console.log('Update result:', result);

    if (result.matchedCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Payroll entry not found',
        data: null
      });
    }

    res.status(200).json({
      status: 'success',
      data: updatedEntry
    });
  } catch (error) {
    console.error('Error updating payroll entry:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update payroll entry',
      error: error.message,
      data: null
    });
  }
};

// Delete a payroll entry
exports.deletePayrollEntry = async (req, res) => {
  try {
    const payrollEntry = await PayrollEntry.findById(req.params.id);

    if (!payrollEntry) {
      return res.status(404).json({
        status: 'error',
        message: 'Payroll entry not found'
      });
    }

    await payrollEntry.remove();

    res.json({
      status: 'success',
      message: 'Payroll entry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete payroll entry',
      error: error.message
    });
  }
};

// Get payroll summary
exports.getPayrollSummary = async (req, res) => {
  try {
    const cursor = await PayrollEntry.find();
    const entries = await cursor.toArray();

    // Calculate summary
    const summary = entries.reduce((acc, entry) => {
      const monthKey = `${entry.year}-${entry.month}`;
      if (!acc[monthKey]) {
        acc[monthKey] = {
          _id: {
            month: entry.month,
            year: entry.year
          },
          totalAmount: 0,
          totalDeductions: 0,
          totalNetPay: 0,
          count: 0
        };
      }
      acc[monthKey].totalAmount += entry.totalAmount;
      acc[monthKey].totalDeductions += entry.deductions;
      acc[monthKey].totalNetPay += entry.netPay;
      acc[monthKey].count += 1;
      return acc;
    }, {});

    // Convert to array and sort
    const summaryArray = Object.values(summary).sort((a, b) => {
      if (a._id.year !== b._id.year) {
        return b._id.year - a._id.year;
      }
      return b._id.month - a._id.month;
    });

    res.json({
      status: 'success',
      data: summaryArray || []
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch payroll summary',
      error: error.message,
      data: []
    });
  }
};

// Export payroll data
exports.exportPayroll = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payroll Data');

    // Add headers
    worksheet.columns = [
      { header: 'Month', key: 'month', width: 15 },
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Driver Name', key: 'driverName', width: 30 },
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Basic Salary', key: 'basicSalary', width: 15 },
      { header: 'Allowances', key: 'allowances', width: 15 },
      { header: 'Deductions', key: 'deductions', width: 15 },
      { header: 'Net Pay', key: 'netPay', width: 15 }
    ];

    // Get all payroll entries
    const cursor = await PayrollEntry.find();
    const payrollEntries = await cursor.toArray();

    // Add data rows
    payrollEntries.forEach(entry => {
      worksheet.addRow({
        month: entry.month,
        year: entry.year,
        driverName: `${entry.driverId.firstName} ${entry.driverId.lastName}`,
        employeeId: entry.driverId.employeeId,
        basicSalary: entry.basicSalary,
        allowances: entry.allowances,
        deductions: entry.deductions,
        netPay: entry.netPay
      });
    });

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=payroll-data.xlsx'
    );

    // Send the workbook
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to export payroll data',
      error: error.message
    });
  }
};

// Get all drivers for dropdown
exports.getDrivers = async (req, res) => {
  try {
    const cursor = await Driver.find();
    const drivers = await cursor.toArray();

    // Format drivers for dropdown
    const formattedDrivers = drivers.map(driver => {
      const driverObj = driver.toJSON();
      return {
        _id: driverObj._id.toString(),
        label: `${driverObj.firstName} ${driverObj.lastName}`,
        value: driverObj._id.toString(),
        employeeId: driverObj.employeeId,
        status: driverObj.status,
        firstName: driverObj.firstName,
        lastName: driverObj.lastName
      };
    });

    console.log('Formatted drivers:', formattedDrivers); // Debug log

    res.json({
      status: 'success',
      data: formattedDrivers || []
    });
  } catch (error) {
    console.error('Error fetching drivers:', error); // Debug log
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch drivers',
      error: error.message,
      data: []
    });
  }
};

// Test endpoint to create a driver
exports.createTestDriver = async (req, res) => {
  try {
    const testDriver = new Driver({
      firstName: 'Test',
      lastName: 'Driver',
      employeeId: 'TEST001',
      status: 'active',
      contactNumber: '1234567890',
      email: 'test@example.com',
      licenseNumber: 'TEST123',
      licenseExpiry: new Date('2025-12-31')
    });

    await testDriver.save();
    
    res.status(201).json({
      status: 'success',
      data: testDriver
    });
  } catch (error) {
    console.error('Error creating test driver:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create test driver',
      error: error.message,
      data: null
    });
  }
}; 