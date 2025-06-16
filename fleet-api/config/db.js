/**
 * Database configuration and connection handling
 * Includes fallback to mock data when MongoDB is not available
 */
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Import mock data for offline/testing use
const mockData = require('./mock-data');

// MongoDB Connection
const MONGODB_URI = "mongodb+srv://devxulfiqar:nSISUpLopruL7S8j@mypaperlessoffice.z5g84.mongodb.net/?retryWrites=true&w=majority&appName=mypaperlessofficet-management" ;
const DB_NAME = process.env.DB_NAME || 'fleet-management';

// MongoDB connection options
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Increased from 15000 to 30000
    socketTimeoutMS: 60000, // Increased from 45000 to 60000
    connectTimeoutMS: 30000, // Increased from 15000 to 30000
    maxPoolSize: 10,
    minPoolSize: 5,
    retryWrites: true,
    w: 'majority',
    retryReads: true
};

// Collections
const COLLECTIONS = {
    drivers: 'drivers',
    vehicles: 'vehicles',
    maintenance: 'maintenance',
    fuel: 'fuel',
    contracts: 'contracts',
    expenses: 'expenses',
    companies: 'companies',
    users: 'users',
    payrollentries: 'payrollentries',
    notes: 'notes',
    payroll: 'payroll',
    invoices: 'invoices',
    receipts: 'receipts'
};

// DB connection instance
let dbInstance = null;
let client = null;
let useMockData = false;

/**
 * Mock collection class that mimics MongoDB Collection API
 */
class MockCollection {
  constructor(name, data) {
    this.name = name;
    this.data = [...data]; // Clone the data to avoid mutations affecting the source
  }

  async find(query = {}) {
    // Simple implementation of find with filtering
    let results = this.data;
    
    // Apply basic filtering (exact matches only)
    if (Object.keys(query).length > 0) {
      results = results.filter(item => {
        return Object.entries(query).every(([key, value]) => {
          return item[key] === value;
        });
      });
    }
    
    // Return object with toArray method to match MongoDB API
    return {
      toArray: async () => results
    };
  }

  async findOne(query = {}) {
    // Handle _id queries specially since ObjectId comparison is not straightforward
    if (query._id) {
      const idStr = query._id.toString();
      return this.data.find(item => item._id.toString() === idStr) || null;
    }
    
    // Simple implementation for other queries
    return this.data.find(item => {
      return Object.entries(query).every(([key, value]) => {
        return item[key] === value;
      });
    }) || null;
  }

  async insertOne(document) {
    // Add _id if not present
    if (!document._id) {
      document._id = require('mongodb').ObjectId();
    }
    
    this.data.push(document);
    return {
      acknowledged: true,
      insertedId: document._id
    };
  }

  async updateOne(filter, update) {
    const index = this.data.findIndex(item => {
      if (filter._id) {
        return item._id.toString() === filter._id.toString();
      }
      return Object.entries(filter).every(([key, value]) => {
        return item[key] === value;
      });
    });

    if (index === -1) {
      return { matchedCount: 0, modifiedCount: 0 };
    }

    // Handle $set operator
    if (update.$set) {
      this.data[index] = {
        ...this.data[index],
        ...update.$set
      };
    }

    return { matchedCount: 1, modifiedCount: 1 };
  }

  async deleteOne(filter) {
    const initialLength = this.data.length;
    
    if (filter._id) {
      this.data = this.data.filter(item => item._id.toString() !== filter._id.toString());
    } else {
      this.data = this.data.filter(item => {
        return !Object.entries(filter).every(([key, value]) => {
          return item[key] === value;
        });
      });
    }

    return {
      deletedCount: initialLength - this.data.length
    };
  }
}

/**
 * Mock database class that mimics MongoDB Db API
 */
class MockDatabase {
  constructor() {
    this.collections = {};
    
    // Initialize collections with mock data
    for (const [name, data] of Object.entries(mockData)) {
      this.collections[name] = new MockCollection(name, data);
    }
  }

  collection(name) {
    // Create collection if it doesn't exist
    if (!this.collections[name]) {
      this.collections[name] = new MockCollection(name, []);
    }
    return this.collections[name];
  }

  async listCollections() {
    return {
      toArray: async () => Object.keys(this.collections).map(name => ({ name }))
    };
  }

  async createCollection(name) {
    if (!this.collections[name]) {
      this.collections[name] = new MockCollection(name, []);
    }
    return this.collections[name];
  }
}

/**
 * Connect to MongoDB and return database instance
 * Falls back to mock data if connection fails
 * @returns {Promise<Object>} MongoDB database instance or mock database
 */
const connectToDatabase = async () => {
    try {
        if (dbInstance) {
            return dbInstance;
        }

        console.log('Connecting to MongoDB...');
        client = await MongoClient.connect(MONGODB_URI, options);
        dbInstance = client.db(DB_NAME);
        
        // Test the connection
        await dbInstance.command({ ping: 1 });
        console.log('Connected to MongoDB successfully');
        
        // Set up connection error handling
        client.on('error', (error) => {
            console.error('MongoDB connection error:', error);
        });

        client.on('close', () => {
            console.log('MongoDB connection closed');
            dbInstance = null;
        });
        
        return dbInstance;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        console.log('Falling back to mock data...');
        useMockData = true;
        return new MockDatabase();
    }
};

/**
 * Get the database instance, connect if not already connected
 * @returns {Promise<Object>} MongoDB database instance or mock database
 */
const getDb = async () => {
    if (!dbInstance) {
        await connectToDatabase();
    }
    return dbInstance;
};

/**
 * Get a specific collection
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<Collection>} MongoDB collection or mock collection
 */
const getCollection = async (collectionName) => {
    const db = await getDb();
    return db.collection(collectionName);
};

/**
 * Check if we're using mock data
 * @returns {boolean} True if using mock data
 */
const isUsingMockData = () => {
  return useMockData;
};

/**
 * Close the database connection
 */
const closeConnection = async () => {
    if (client) {
        await client.close();
        client = null;
        dbInstance = null;
    }
};

module.exports = {
    connectToDatabase,
    getDb,
    getCollection,
    closeConnection,
    isUsingMockData,
    COLLECTIONS
}; 