const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes
router.post('/register', authController.registerCompany);
router.post('/login', authController.login);
router.get('/profile/:id', authController.getProfile);
router.patch('/profile/:id', authController.updateProfile);

module.exports = router; 