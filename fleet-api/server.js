const express = require('express');
const cors = require('cors');
const { ObjectId } = require('mongodb');
require('dotenv').config();

// Import database configuration
const db = require('./config/db');

// Import middleware
const { authenticate } = require('./middleware/auth');

// Import routes
const driverRoutes = require('./routes/driverRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const costRoutes = require('./routes/costRoutes');
const noteRoutes = require('./routes/noteRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const companyRoutes = require('./routes/companyRoutes');
const receiptRoutes = require('./routes/receiptRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await db.connectToDatabase();
    res.status(200).json({ status: 'ok', message: 'API server is running and connected to MongoDB' });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/costs', costRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/receipts', receiptRoutes);

// Generic API routes for other collections
const COLLECTIONS = db.COLLECTIONS;
delete COLLECTIONS.drivers; // We have a dedicated route for drivers
delete COLLECTIONS.expenses; // We have a dedicated route for expenses
delete COLLECTIONS.receipts; // We have a dedicated route for receipts

Object.entries(COLLECTIONS).forEach(([key, collectionName]) => {
  // Get all documents
  app.get(`/api/${collectionName}`, authenticate, async (req, res) => {
    try {
      // Get company ID from authenticated user
      const companyId = req.user.companyId;
      
      if (!companyId) {
        return res.status(400).json({
          status: 'error',
          message: 'Company ID not found in user token'
        });
      }
      
      const collection = await db.getCollection(collectionName);
      const result = await collection.find({ 
        companyId: companyId.toString() 
      }).toArray();
      
      res.status(200).json(result);
    } catch (error) {
      console.error(`Error getting all ${collectionName}:`, error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // Get document by ID
  app.get(`/api/${collectionName}/:id`, authenticate, async (req, res) => {
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
      const collection = await db.getCollection(collectionName);
      const result = await collection.findOne({ 
        _id: new ObjectId(id),
        companyId: companyId.toString()
      });
      
      if (!result) {
        return res.status(404).json({ status: 'error', message: `${key} not found` });
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error(`Error getting ${key} by ID:`, error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // Create new document
  app.post(`/api/${collectionName}`, authenticate, async (req, res) => {
    try {
      // Get company ID from authenticated user
      const companyId = req.user.companyId;
      
      if (!companyId) {
        return res.status(400).json({
          status: 'error',
          message: 'Company ID not found in user token'
        });
      }
      
      const newDoc = {
        ...req.body,
        companyId: companyId.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const collection = await db.getCollection(collectionName);
      const result = await collection.insertOne(newDoc);
      
      res.status(201).json({
        status: 'success',
        _id: result.insertedId,
        ...newDoc
      });
    } catch (error) {
      console.error(`Error creating ${key}:`, error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // Update document
  app.put(`/api/${collectionName}/:id`, authenticate, async (req, res) => {
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
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };
      
      // Ensure companyId cannot be changed
      delete updateData.companyId;
      
      const collection = await db.getCollection(collectionName);
      
      // First check if document exists and belongs to this company
      const existingDoc = await collection.findOne({
        _id: new ObjectId(id),
        companyId: companyId.toString()
      });
      
      if (!existingDoc) {
        return res.status(404).json({ 
          status: 'error', 
          message: `${key} not found or access denied` 
        });
      }
      
      const result = await collection.updateOne(
        { _id: new ObjectId(id), companyId: companyId.toString() },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ status: 'error', message: `${key} not found` });
      }
      
      const updatedDoc = await collection.findOne({ _id: new ObjectId(id) });
      res.status(200).json(updatedDoc);
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // Delete document
  app.delete(`/api/${collectionName}/:id`, authenticate, async (req, res) => {
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
      const collection = await db.getCollection(collectionName);
      
      // Check if document exists and belongs to this company
      const existingDoc = await collection.findOne({
        _id: new ObjectId(id),
        companyId: companyId.toString()
      });
      
      if (!existingDoc) {
        return res.status(404).json({ 
          status: 'error', 
          message: `${key} not found or access denied` 
        });
      }
      
      const result = await collection.deleteOne({ 
        _id: new ObjectId(id),
        companyId: companyId.toString()
      });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ status: 'error', message: `${key} not found` });
      }
      
      res.status(200).json({ status: 'success', message: `${key} deleted successfully` });
    } catch (error) {
      console.error(`Error deleting ${key}:`, error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // Search documents
  app.get(`/api/${collectionName}/search`, authenticate, async (req, res) => {
    try {
      // Get company ID from authenticated user
      const companyId = req.user.companyId;
      
      if (!companyId) {
        return res.status(400).json({
          status: 'error',
          message: 'Company ID not found in user token'
        });
      }
      
      // Convert query params to MongoDB query
      const query = {
        // Always filter by company ID
        companyId: companyId.toString()
      };
      
      // Remove non-filter parameters
      const { page, limit, sort, ...filters } = req.query;
      
      // Build the query from the remaining filters
      Object.entries(filters).forEach(([key, value]) => {
        // Handle special query operators like gt, lt, etc.
        if (key.includes('_')) {
          const [field, operator] = key.split('_');
          query[field] = query[field] || {};
          
          switch (operator) {
            case 'gt':
              query[field]['$gt'] = Number(value);
              break;
            case 'lt':
              query[field]['$lt'] = Number(value);
              break;
            case 'gte':
              query[field]['$gte'] = Number(value);
              break;
            case 'lte':
              query[field]['$lte'] = Number(value);
              break;
            default:
              query[key] = value;
          }
        } else {
          // Use regex for string fields to enable partial matches
          if (typeof value === 'string') {
            query[key] = { $regex: value, $options: 'i' };
          } else {
            query[key] = value;
          }
        }
      });
      
      const collection = await db.getCollection(collectionName);
      const result = await collection.find(query).toArray();
      res.status(200).json(result);
    } catch (error) {
      console.error(`Error searching ${collectionName}:`, error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  });
});

// Start the server with error handling
const server = app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await db.connectToDatabase();
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
    server.close();
    app.listen(PORT + 1, async () => {
      console.log(`Server is running on port ${PORT + 1}`);
      await db.connectToDatabase();
    });
  } else {
    console.error('Server error:', err);
  }
});

// Handle server shutdown
process.on('SIGINT', async () => {
  console.log('Server shutting down...');
  await db.closeConnection();
  process.exit(0);
});
