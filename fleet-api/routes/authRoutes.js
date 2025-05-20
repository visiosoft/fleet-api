const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authenticate } = require('../middleware/auth');
const { MongoClient, ObjectId } = require('mongodb');
const db = require('../config/db');

// Default admin user (only used if no users exist in the database)
const defaultUser = {
  email: 'admin@example.com',
  password: 'admin123', // Plain text password
  role: 'admin',
  companyId: '1'
};

// Default company (only used if no companies exist in the database)
const defaultCompany = {
  _id: '1',
  id: '1',
  name: 'Default Fleet Company',
  address: '123 Fleet Street',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  phone: '555-123-4567',
  email: 'contact@fleetcompany.com',
  status: 'active'
};

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Login attempt:', { email });

    // Get collections
    const usersCollection = await db.getCollection('users');
    const companiesCollection = await db.getCollection('companies');

    // Find user in database
    let user = await usersCollection.findOne({ email });

    // If user not found, check if we should use the default user
    if (!user) {
      // Check if we have any users in the database
      const userCount = await usersCollection.countDocuments({});
      
      if (userCount === 0 && email === defaultUser.email) {
        console.log('Using default user and company');
        
        // Create default company
        const companyResult = await companiesCollection.insertOne({
          ...defaultCompany,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        // Create default user with password hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultUser.password, salt);
        
        const userResult = await usersCollection.insertOne({
          firstName: 'Admin',
          lastName: 'User',
          email: defaultUser.email,
          password: hashedPassword,
          role: defaultUser.role,
          companyId: companyResult.insertedId.toString(),
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        // Get the inserted user
        user = await usersCollection.findOne({ _id: userResult.insertedId });
      } else {
        console.log('User not found');
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }
    }

    // Password verification bypassed temporarily
    // const isMatch = await bcrypt.compare(password, user.password);
    // console.log('Password match:', isMatch);
    // if (!isMatch) {
    //   return res.status(401).json({
    //     status: 'error',
    //     message: 'Invalid credentials'
    //   });
    // }

    // Find company
    const company = await companiesCollection.findOne({ _id: new ObjectId(user.companyId) });
    if (!company) {
      return res.status(500).json({
        status: 'error',
        message: 'Company not found'
      });
    }

    // Convert ObjectId to string for token
    const userIdStr = user._id.toString();
    const companyIdStr = company._id.toString();

    // Update last login
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    // Generate token
    const token = jwt.sign(
      { 
        userId: userIdStr,
        role: user.role,
        companyId: companyIdStr
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      status: 'success',
      data: {
        token,
        user: {
          id: userIdStr,
          email: user.email,
          role: user.role
        },
        company: {
          ...company,
          id: companyIdStr
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: error.message
    });
  }
});

// Register a new company with admin user
router.post('/register', async (req, res) => {
  try {
    const { companyData, adminData } = req.body;

    // Validate required fields
    if (!companyData || !adminData) {
      return res.status(400).json({
        status: 'error',
        message: 'Company data and admin data are required'
      });
    }

    // Get collections
    const usersCollection = await db.getCollection('users');
    const companiesCollection = await db.getCollection('companies');

    // Check if company email already exists
    const existingCompany = await companiesCollection.findOne({ email: companyData.email });
    if (existingCompany) {
      return res.status(400).json({
        status: 'error',
        message: 'Company with this email already exists'
      });
    }

    // Check if user email already exists
    const existingUser = await usersCollection.findOne({ email: adminData.email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Create new company
    const companyResult = await companiesCollection.insertOne({
      ...companyData,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const companyId = companyResult.insertedId;

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);
    
    // Create new admin user
    const userResult = await usersCollection.insertOne({
      ...adminData,
      password: hashedPassword,
      role: 'admin',
      companyId: companyId.toString(),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const userId = userResult.insertedId;

    // Get the created company and user
    const company = await companiesCollection.findOne({ _id: companyId });
    const user = await usersCollection.findOne({ _id: userId });

    // Generate token
    const token = jwt.sign(
      { 
        userId: userId.toString(),
        role: user.role,
        companyId: companyId.toString()
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      status: 'success',
      data: {
        token,
        user: {
          id: userId.toString(),
          email: user.email,
          role: user.role
        },
        company: {
          ...company,
          id: companyId.toString()
        }
      },
      message: 'Company and admin user created successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const companyId = req.user.companyId;
    
    // Get collections
    const usersCollection = await db.getCollection('users');
    const companiesCollection = await db.getCollection('companies');
    
    // Get user and company
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    const company = await companiesCollection.findOne({ _id: new ObjectId(companyId) });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Remove sensitive information
    const userWithoutSensitive = { ...user };
    delete userWithoutSensitive.password;
    
    res.json({
      status: 'success',
      data: {
        user: userWithoutSensitive,
        company
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user profile',
      error: error.message
    });
  }
});

module.exports = router; 