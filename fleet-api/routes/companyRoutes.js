const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticate, authorize } = require('../middleware/auth');

// Get all companies
router.get('/', authenticate, companyController.getCompanies);

// Get company by ID
router.get('/:id', authenticate, companyController.getCompanyById);

// Create new company
router.post('/', authenticate, authorize(['admin']), companyController.createCompany);

// Update company
router.put('/:id', authenticate, authorize(['admin']), companyController.updateCompany);

// Delete company
router.delete('/:id', authenticate, authorize(['admin']), companyController.deleteCompany);

// Get users by company ID
router.get('/:id/users', authenticate, companyController.getCompanyUsers);

module.exports = router; 