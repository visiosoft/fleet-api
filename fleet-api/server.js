const express = require('express');
const cors = require('cors');
const { ObjectId } = require('mongodb');
require('dotenv').config();

// Import database configuration
const db = require('./config/db');

// Import routes
const driverRoutes = require('./routes/driverRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

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

// Generic API routes for other collections
const COLLECTIONS = db.COLLECTIONS;
delete COLLECTIONS.drivers; // We have a dedicated route for drivers
delete COLLECTIONS.expenses; // We have a dedicated route for expenses

Object.entries(COLLECTIONS).forEach(([key, collectionName]) => {
  // Get all documents
  app.get(`/api/${collectionName}`, async (req, res) => {
    try {
      const collection = await db.getCollection(collectionName);
      const result = await collection.find({}).toArray();
      res.status(200).json(result);
    } catch (error) {
      console.error(`Error getting all ${collectionName}:`, error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // Get document by ID
  app.get(`/api/${collectionName}/:id`, async (req, res) => {
    try {
      const id = req.params.id;
      const collection = await db.getCollection(collectionName);
      const result = await collection.findOne({ _id: new ObjectId(id) });
      
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
  app.post(`/api/${collectionName}`, async (req, res) => {
    try {
      const newDoc = req.body;
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
  app.put(`/api/${collectionName}/:id`, async (req, res) => {
    try {
      const id = req.params.id;
      const updateData = req.body;
      const collection = await db.getCollection(collectionName);
      
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
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
  app.delete(`/api/${collectionName}/:id`, async (req, res) => {
    try {
      const id = req.params.id;
      const collection = await db.getCollection(collectionName);
      
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      
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
  app.get(`/api/${collectionName}/search`, async (req, res) => {
    try {
      // Convert query params to MongoDB query
      const query = {};
      
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error', 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await db.connectToDatabase();
    
    // Then start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle server shutdown
process.on('SIGINT', async () => {
  console.log('Server shutting down...');
  await db.closeConnection();
  process.exit(0);
});
