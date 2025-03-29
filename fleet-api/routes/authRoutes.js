const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authenticate } = require('../middleware/auth');

// Mock user data (replace with your actual user model)
const users = [
  {
    _id: '1',
    email: 'admin@example.com',
    password: 'admin123', // Plain text password
    role: 'admin',
    companyId: '1'
  }
];

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email }); // Add logging

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      console.log('User not found'); // Add logging
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Direct password comparison
    const isMatch = password === user.password;
    console.log('Password match:', isMatch); // Add logging

    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role,
        companyId: user.companyId
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      status: 'success',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error); // Add error logging
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: error.message
    });
  }
});

// Get current user
router.get('/me', authenticate, (req, res) => {
  res.json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

module.exports = router; 