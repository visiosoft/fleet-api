const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all invoice routes
router.use(authenticate);

// Get all invoices
router.get('/', invoiceController.getAllInvoices);

// Get invoice statistics
router.get('/stats', invoiceController.getInvoiceStats);

// Get single invoice
router.get('/:id', invoiceController.getInvoiceById);

// Create new invoice
router.post('/', invoiceController.createInvoice);

// Update invoice
router.put('/:id', invoiceController.updateInvoice);

// Delete invoice
router.delete('/:id', invoiceController.deleteInvoice);

// Add payment to invoice
router.post('/:id/payments', invoiceController.addPayment);

// Send invoice
router.post('/:id/send', invoiceController.sendInvoice);

// Get invoices by contract
router.get('/contract/:contractId', invoiceController.getInvoicesByContract);

module.exports = router; 