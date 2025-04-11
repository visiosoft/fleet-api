const PayrollEntry = require('../models/PayrollEntry');
const Driver = require('../models/Driver');
const ExcelJS = require('exceljs');
const { ObjectId } = require('mongodb');
const db = require('../config/db');

// Get all payroll entries
exports.getAllPayrollEntries = async (req, res) => {
  try {
    // Get company ID from authenticated user
    const companyId = req.user.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in user token'
      });
    }
    
    console.log(`Fetching payroll entries for company ID: ${companyId}`);
    
    // Get the collection
    const collection = await db.getCollection('payrollentries');
    
    // Find entries for this company
    const payrollEntries = await collection.find({
      companyId: companyId.toString()
    }).toArray();
    
    console.log(`Found ${payrollEntries.length} payroll entries for company ${companyId}`);

    res.json({
      status: 'success',
      data: payrollEntries
    });
  } catch (error) {
    console.error('Error fetching payroll entries:', error);
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
    // Get company ID from authenticated user
    const companyId = req.user.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in user token'
      });
    }
    
    const id = req.params.id;
    console.log(`Fetching payroll entry ${id} for company ID: ${companyId}`);
    
    // Get the collection
    const collection = await db.getCollection('payrollentries');
    
    // Find entry for this company
    const payrollEntry = await collection.findOne({
      _id: new ObjectId(id),
      companyId: companyId.toString()
    });

    if (!payrollEntry) {
      return res.status(404).json({
        status: 'error',
        message: 'Payroll entry not found'
      });
    }
    
    console.log(`Found payroll entry: ${payrollEntry._id}`);

    res.json({
      status: 'success',
      data: payrollEntry
    });
  } catch (error) {
    console.error('Error fetching payroll entry:', error);
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
    // Get company ID from authenticated user
    const companyId = req.user.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in user token'
      });
    }
    
    console.log(`Creating payroll entry for company ID: ${companyId}`);
    console.log('Creating payroll entry with data:', req.body); // Debug log

    // Get the collection
    const collection = await db.getCollection('payrollentries');
    
    // Check for duplicate entry
    const existingEntry = await collection.findOne({
      driverName: req.body.driverName,
      month: req.body.month.split('-')[1], // Extract month from YYYY-MM format
      year: parseInt(req.body.month.split('-')[0]), // Extract year from YYYY-MM format
      companyId: companyId.toString()
    });

    console.log('Checking for existing entry:', existingEntry); // Debug log

    if (existingEntry) {
      return res.status(400).json({
        status: 'error',
        message: 'Payroll entry already exists for this driver and month',
        data: null
      });
    }

    // Create payroll entry with company ID
    const payrollEntry = {
      ...req.body,
      companyId: companyId.toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('PayrollEntry to be saved:', payrollEntry);

    // Insert the entry
    const result = await collection.insertOne(payrollEntry);
    console.log('Payroll entry saved successfully with ID:', result.insertedId);

    res.status(201).json({
      status: 'success',
      data: {
        _id: result.insertedId,
        ...payrollEntry
      }
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
    // Get company ID from authenticated user
    const companyId = req.user.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in user token'
      });
    }
    
    const id = req.params.id;
    console.log(`Updating payroll entry ${id} for company ID: ${companyId}`);
    console.log('Update data:', req.body);

    // Get the collection
    const collection = await db.getCollection('payrollentries');

    // Find the existing entry and ensure it belongs to this company
    const existingEntry = await collection.findOne({ 
      _id: new ObjectId(id),
      companyId: companyId.toString()
    });
    
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
      companyId: companyId.toString(), // Ensure company ID doesn't change
      updatedAt: new Date()
    };

    // If status is being updated to 'paid', set paymentDate
    if (req.body.status === 'paid') {
      updatedEntry.paymentDate = new Date();
    }

    // Update the entry
    const result = await collection.updateOne(
      { _id: new ObjectId(id), companyId: companyId.toString() },
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
    // Get company ID from authenticated user
    const companyId = req.user.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in user token'
      });
    }
    
    const id = req.params.id;
    console.log(`Deleting payroll entry ${id} for company ID: ${companyId}`);
    
    // Get the collection
    const collection = await db.getCollection('payrollentries');
    
    // Find the entry and ensure it belongs to this company
    const payrollEntry = await collection.findOne({
      _id: new ObjectId(id),
      companyId: companyId.toString()
    });

    if (!payrollEntry) {
      return res.status(404).json({
        status: 'error',
        message: 'Payroll entry not found'
      });
    }

    // Delete the entry
    await collection.deleteOne({
      _id: new ObjectId(id),
      companyId: companyId.toString()
    });

    res.json({
      status: 'success',
      message: 'Payroll entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payroll entry:', error);
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
    // Get company ID from authenticated user
    const companyId = req.user.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in user token'
      });
    }
    
    console.log(`Fetching payroll summary for company ID: ${companyId}`);
    
    // Get the collection
    const collection = await db.getCollection('payrollentries');
    
    // Find entries for this company
    const entries = await collection.find({
      companyId: companyId.toString()
    }).toArray();
    
    console.log(`Found ${entries.length} payroll entries for summary`);

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
    // Get company ID from authenticated user
    const companyId = req.user.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in user token'
      });
    }
    
    console.log(`Exporting payroll data for company ID: ${companyId}`);
    
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

    // Get the collection
    const collection = await db.getCollection('payrollentries');
    
    // Get all payroll entries for this company
    const payrollEntries = await collection.find({
      companyId: companyId.toString()
    }).toArray();
    
    console.log(`Found ${payrollEntries.length} payroll entries for export`);

    // Add data rows
    payrollEntries.forEach(entry => {
      worksheet.addRow({
        month: entry.month,
        year: entry.year,
        driverName: entry.driverName,
        employeeId: entry.employeeId,
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
    console.error('Error exporting payroll data:', error);
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
    // Get company ID from authenticated user
    const companyId = req.user.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in user token'
      });
    }
    
    console.log(`Fetching drivers for company ID: ${companyId}`);
    
    // Get the collection
    const driversCollection = await db.getCollection('drivers');
    
    // Get drivers for this company
    const drivers = await driversCollection.find({
      companyId: companyId.toString()
    }).toArray();
    
    console.log(`Found ${drivers.length} drivers for company ${companyId}`);

    // Format drivers for dropdown
    const formattedDrivers = drivers.map(driver => {
      return {
        _id: driver._id.toString(),
        label: `${driver.firstName} ${driver.lastName}`,
        value: driver._id.toString(),
        employeeId: driver.employeeId,
        status: driver.status,
        firstName: driver.firstName,
        lastName: driver.lastName
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
    // Get company ID from authenticated user
    const companyId = req.user.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in user token'
      });
    }
    
    console.log(`Creating test driver for company ID: ${companyId}`);
    
    // Get the collection
    const driversCollection = await db.getCollection('drivers');
    
    const testDriver = {
      firstName: 'Test',
      lastName: 'Driver',
      employeeId: 'TEST001',
      status: 'active',
      contactNumber: '1234567890',
      email: 'test@example.com',
      licenseNumber: 'TEST123',
      licenseExpiry: new Date('2025-12-31'),
      companyId: companyId.toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await driversCollection.insertOne(testDriver);
    testDriver._id = result.insertedId;
    
    console.log(`Test driver created with ID: ${result.insertedId}`);
    
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