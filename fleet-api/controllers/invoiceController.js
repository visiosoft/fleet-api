const { ObjectId } = require('mongodb');
const InvoiceModel = require('../models/invoiceModel');
const ContractModel = require('../models/Contract');
const { validateObjectId } = require('../utils/validation');

// Get all invoices
exports.getAllInvoices = async (req, res) => {
    try {
        // Get company ID from authenticated user
        const companyId = req.user.companyId;
        
        if (!companyId) {
            return res.status(400).json({
                status: 'error',
                message: 'Company ID not found in user token'
            });
        }
        
        console.log(`Fetching invoices for company ID: ${companyId}`);
        
        const collection = await InvoiceModel.getCollection();
        const invoices = await collection.find({
            companyId: companyId.toString()
        })
            .sort({ createdAt: -1 })
            .toArray();
        
        // Ensure includeVat is included in response
        const formattedInvoices = invoices.map(invoice => ({
            ...invoice,
            includeVat: invoice.includeVat !== false // default to true if not set
        }));
        
        console.log(`Found ${invoices.length} invoices for company ${companyId}`);
        
        res.status(200).json({
            status: 'success',
            data: formattedInvoices
        });
    } catch (error) {
        console.error('Error getting all invoices:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get single invoice by ID
exports.getInvoiceById = async (req, res) => {
    try {
        // Get company ID from authenticated user
        const companyId = req.user.companyId;
        
        if (!companyId) {
            return res.status(400).json({
                status: 'error',
                message: 'Company ID not found in user token'
            });
        }
        
        const id = req.params.id;
        console.log(`Fetching invoice ${id} for company ID: ${companyId}`);
        
        const collection = await InvoiceModel.getCollection();
        const invoice = await collection.findOne({ 
            _id: new ObjectId(id),
            companyId: companyId.toString()
        });

        if (!invoice) {
            return res.status(404).json({
                status: 'error',
                message: 'Invoice not found'
            });
        }
        
        // Ensure includeVat is included in response
        const formattedInvoice = {
            ...invoice,
            includeVat: invoice.includeVat !== false // default to true if not set
        };
        
        console.log(`Found invoice ${id}`);

        res.status(200).json({
            status: 'success',
            data: formattedInvoice
        });
    } catch (error) {
        console.error('Error getting invoice by ID:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Create new invoice
exports.createInvoice = async (req, res) => {
    try {
        // Get company ID from authenticated user
        const companyId = req.user.companyId;
        
        if (!companyId) {
            return res.status(400).json({
                status: 'error',
                message: 'Company ID not found in user token'
            });
        }
        
        console.log(`Creating invoice for company ID: ${companyId}`);
        
        const { contractId, invoiceNumber, issueDate, dueDate, items, tax, includeVat, notes } = req.body;

        // Check if contract exists and belongs to company
        const contractCollection = await ContractModel.getCollection();
        const contract = await contractCollection.findOne({ 
            _id: new ObjectId(contractId),
            companyId: companyId.toString()
        });
        
        if (!contract) {
            return res.status(404).json({
                status: 'error',
                message: 'Contract not found or belongs to another company'
            });
        }

        // Check if invoice number is unique within company
        const collection = await InvoiceModel.getCollection();
        const existingInvoice = await collection.findOne({ 
            invoiceNumber,
            companyId: companyId.toString()
        });
        
        if (existingInvoice) {
            return res.status(400).json({
                status: 'error',
                message: 'Invoice number already exists'
            });
        }

        const invoice = {
            contractId: new ObjectId(contractId),
            invoiceNumber,
            issueDate,
            dueDate,
            items,
            tax: includeVat ? (tax || 0) : 0,
            includeVat: includeVat !== false, // default to true if not specified
            notes,
            status: 'draft',
            companyId: companyId.toString(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await collection.insertOne(invoice);
        invoice._id = result.insertedId;
        
        console.log(`Invoice created with ID: ${result.insertedId}`);

        res.status(201).json({
            status: 'success',
            data: invoice
        });
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update invoice
exports.updateInvoice = async (req, res) => {
    try {
        // Get company ID from authenticated user
        const companyId = req.user.companyId;
        
        if (!companyId) {
            return res.status(400).json({
                status: 'error',
                message: 'Company ID not found in user token'
            });
        }
        
        const id = req.params.id;
        console.log(`Updating invoice ${id} for company ID: ${companyId}`);
        
        const collection = await InvoiceModel.getCollection();
        const invoice = await collection.findOne({ 
            _id: new ObjectId(id),
            companyId: companyId.toString()
        });
        
        if (!invoice) {
            return res.status(404).json({
                status: 'error',
                message: 'Invoice not found'
            });
        }

        // Only allow updating certain fields
        const allowedUpdates = ['items', 'subtotal', 'tax', 'includeVat', 'total', 'notes', 'status', 'issueDate', 'dueDate'];
        const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));
        
        const updateData = {};
        updates.forEach(update => {
            if (update === 'tax' && !req.body.includeVat) {
                updateData[update] = 0;
            } else {
                updateData[update] = req.body[update];
            }
        });
        updateData.updatedAt = new Date();
        updateData.companyId = companyId.toString(); // Ensure company ID doesn't change

        const result = await collection.updateOne(
            { _id: new ObjectId(id), companyId: companyId.toString() },
            { $set: updateData }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No updates were made'
            });
        }

        const updatedInvoice = await collection.findOne({ _id: new ObjectId(id) });
        
        // Ensure includeVat is included in response
        const formattedInvoice = {
            ...updatedInvoice,
            includeVat: updatedInvoice.includeVat !== false // default to true if not set
        };
        
        console.log(`Invoice ${id} updated successfully`);

        res.status(200).json({
            status: 'success',
            data: formattedInvoice
        });
    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Delete invoice
exports.deleteInvoice = async (req, res) => {
    try {
        // Get company ID from authenticated user
        const companyId = req.user.companyId;
        
        if (!companyId) {
            return res.status(400).json({
                status: 'error',
                message: 'Company ID not found in user token'
            });
        }
        
        const id = req.params.id;
        console.log(`Deleting invoice ${id} for company ID: ${companyId}`);
        
        const collection = await InvoiceModel.getCollection();
        
        // Verify invoice belongs to company before deleting
        const invoiceToDelete = await collection.findOne({
            _id: new ObjectId(id),
            companyId: companyId.toString()
        });
        
        if (!invoiceToDelete) {
            return res.status(404).json({
                status: 'error',
                message: 'Invoice not found'
            });
        }
        
        const result = await collection.deleteOne({ 
            _id: new ObjectId(id),
            companyId: companyId.toString()
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Invoice not found'
            });
        }
        
        console.log(`Invoice ${id} deleted successfully`);

        res.status(200).json({
            status: 'success',
            message: 'Invoice deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting invoice:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get invoice statistics
exports.getInvoiceStats = async (req, res) => {
    try {
        // Get company ID from authenticated user
        const companyId = req.user.companyId;
        
        if (!companyId) {
            return res.status(400).json({
                status: 'error',
                message: 'Company ID not found in user token'
            });
        }
        
        console.log(`Fetching invoice statistics for company ID: ${companyId}`);
        
        const collection = await InvoiceModel.getCollection();
        const stats = await collection.aggregate([
            {
                $match: {
                    companyId: companyId.toString()
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$total' }
                }
            }
        ]).toArray();

        const totalInvoices = await collection.countDocuments({
            companyId: companyId.toString()
        });
        
        const totalAmount = await collection.aggregate([
            { 
                $match: { 
                    companyId: companyId.toString() 
                } 
            },
            { 
                $group: { 
                    _id: null, 
                    total: { $sum: '$total' } 
                } 
            }
        ]).toArray();
        
        console.log(`Found statistics for ${totalInvoices} invoices`);

        res.status(200).json({
            status: 'success',
            data: {
                byStatus: stats,
                totalInvoices,
                totalAmount: totalAmount[0]?.total || 0
            }
        });
    } catch (error) {
        console.error('Error getting invoice stats:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Add payment to invoice
exports.addPayment = async (req, res) => {
    try {
        const collection = await InvoiceModel.getCollection();
        const invoice = await collection.findOne({ _id: new ObjectId(req.params.id) });
        
        if (!invoice) {
            return res.status(404).json({
                status: 'error',
                message: 'Invoice not found'
            });
        }

        const { amount, paymentMethod, transactionId, notes } = req.body;
        const payment = {
            amount,
            paymentMethod,
            transactionId,
            notes,
            date: new Date()
        };

        const result = await collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { 
                $push: { payments: payment },
                $set: { 
                    updatedAt: new Date(),
                    status: 'paid' // Update status to paid when payment is added
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Failed to add payment'
            });
        }

        const updatedInvoice = await collection.findOne({ _id: new ObjectId(req.params.id) });

        res.status(200).json({
            status: 'success',
            data: updatedInvoice
        });
    } catch (error) {
        console.error('Error adding payment:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Send invoice
exports.sendInvoice = async (req, res) => {
    try {
        const collection = await InvoiceModel.getCollection();
        const invoice = await collection.findOne({ _id: new ObjectId(req.params.id) });
        
        if (!invoice) {
            return res.status(404).json({
                status: 'error',
                message: 'Invoice not found'
            });
        }

        const result = await collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { 
                $set: { 
                    status: 'sent',
                    sentAt: new Date(),
                    updatedAt: new Date()
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Failed to update invoice status'
            });
        }

        const updatedInvoice = await collection.findOne({ _id: new ObjectId(req.params.id) });

        res.status(200).json({
            status: 'success',
            data: updatedInvoice
        });
    } catch (error) {
        console.error('Error sending invoice:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get invoices by contract
exports.getInvoicesByContract = async (req, res) => {
    try {
        const collection = await InvoiceModel.getCollection();
        const invoices = await collection.find({ 
            contractId: new ObjectId(req.params.contractId) 
        })
        .sort({ createdAt: -1 })
        .toArray();

        // Ensure includeVat is included in response
        const formattedInvoices = invoices.map(invoice => ({
            ...invoice,
            includeVat: invoice.includeVat !== false // default to true if not set
        }));

        res.status(200).json({
            status: 'success',
            data: formattedInvoices
        });
    } catch (error) {
        console.error('Error getting invoices by contract:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}; 