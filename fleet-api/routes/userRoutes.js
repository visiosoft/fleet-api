const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// Get all users
router.get('/', authenticate, userController.getUsers);

// Get user by ID
router.get('/:userId', authenticate, userController.getUserById);

// Create new user
router.post('/', authenticate, userController.createUser);

// Update user
router.put('/:userId', authenticate, userController.updateUser);

// Delete user
router.delete('/:userId', authenticate, userController.deleteUser);

module.exports = router; 