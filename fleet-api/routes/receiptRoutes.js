const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all receipt routes
router.use(authenticate);

// Get receipts by invoice (specific route)
router.get('/invoice/:invoiceId', receiptController.getReceiptsByInvoice);

// Create new receipt
router.post('/', receiptController.createReceipt);

// Get all receipts
router.get('/', receiptController.getAllReceipts);

// Get single receipt
router.get('/:id', receiptController.getReceiptById);

// Update receipt
router.put('/:id', receiptController.updateReceipt);

// Delete receipt
router.delete('/:id', receiptController.deleteReceipt);

module.exports = router; 