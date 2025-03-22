const express = require('express');
const router = express.Router();
const companyContractController = require('../controllers/companyContractController');

// GET /api/contracts - Get all contracts
router.get('/', companyContractController.getAllContracts);

// GET /api/contracts/companies - Get unique companies for dropdown
router.get('/companies', companyContractController.getUniqueCompanies);

// GET /api/contracts/statuses - Get available contract statuses
router.get('/statuses', companyContractController.getContractStatuses);

// GET /api/contracts/expiring - Get contracts expiring in next 30 days
router.get('/expiring', companyContractController.getExpiringContracts);

// GET /api/contracts/stats - Get contract statistics
router.get('/stats', companyContractController.getContractStats);

// GET /api/contracts/:id - Get a specific contract
router.get('/:id', companyContractController.getContractById);

// POST /api/contracts - Create a new contract
router.post('/', companyContractController.createContract);

// PATCH /api/contracts/:id/status - Update contract status
router.patch('/:id/status', companyContractController.updateContractStatus);

// PUT /api/contracts/:id - Update a contract
router.put('/:id', companyContractController.updateContract);

// DELETE /api/contracts/:id - Delete a contract
router.delete('/:id', companyContractController.deleteContract);

// GET /api/contracts/company/:companyName - Get contracts by company
router.get('/company/:companyName', companyContractController.getContractsByCompany);

// GET /api/contracts/license/:tradeLicenseNo - Get contract by trade license
router.get('/license/:tradeLicenseNo', companyContractController.getContractByTradeLicense);

// GET /api/contracts/status/:status - Get contracts by status
router.get('/status/:status', companyContractController.getContractsByStatus);

module.exports = router; 