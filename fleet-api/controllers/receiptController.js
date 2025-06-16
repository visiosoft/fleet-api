const { ObjectId } = require('mongodb');
const ReceiptModel = require('../models/receiptModel');
const InvoiceModel = require('../models/invoiceModel');

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
    try {
        return new ObjectId(id).toString() === id;
    } catch (error) {
        return false;
    }
};

// Get all receipts with pagination
exports.getAllReceipts = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        
        if (!companyId) {
            return res.status(400).json({
                status: 'error',
                message: 'Company ID not found in user token'
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const collection = await ReceiptModel.getCollection();
        
        // Get total count
        const total = await collection.countDocuments({
            companyId: companyId.toString()
        });

        // Get paginated receipts
        const receipts = await collection
            .find({ companyId: companyId.toString() })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        res.json({
            status: 'success',
            data: {
                receipts,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting receipts:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get receipt by ID
exports.getReceiptById = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        
        if (!companyId) {
            return res.status(400).json({
                status: 'error',
                message: 'Company ID not found in user token'
            });
        }

        const id = req.params.id;
        const collection = await ReceiptModel.getCollection();
        const receipt = await collection.findOne({
            _id: new ObjectId(id),
            companyId: companyId.toString()
        });

        if (!receipt) {
            return res.status(404).json({
                status: 'error',
                message: 'Receipt not found'
            });
        }

        res.json({
            status: 'success',
            data: receipt
        });
    } catch (error) {
        console.error('Error getting receipt:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Create new receipt
exports.createReceipt = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        
        if (!companyId) {
            return res.status(400).json({
                status: 'error',
                message: 'Company ID not found in user token'
            });
        }

        const {
            invoiceId,
            amount,
            paymentMethod,
            paymentDate,
            referenceNumber,
            notes,
            clientName,
            clientEmail = '', // Make email optional with default empty string
            status = 'completed' // Default status
        } = req.body;

        // Generate receipt number (you can customize this format)
        const receiptNumber = `RCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const receipt = {
            receiptNumber,
            invoiceId,
            amount: parseFloat(amount),
            paymentMethod,
            paymentDate: new Date(paymentDate),
            referenceNumber,
            notes,
            clientName,
            clientEmail,
            status, // Add status field
            companyId: companyId.toString(),
            companyInfo: {
                name: 'Fleeto',
                address: 'Dubai, UAE',
                email: 'info@fleeto.com'
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await ReceiptModel.getCollection();
        const result = await collection.insertOne(receipt);

        res.status(201).json({
            status: 'success',
            data: {
                id: result.insertedId,
                ...receipt
            }
        });
    } catch (error) {
        console.error('Error creating receipt:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update receipt
exports.updateReceipt = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        
        if (!companyId) {
            return res.status(400).json({
                status: 'error',
                message: 'Company ID not found in user token'
            });
        }

        const id = req.params.id;
        const {
            amount,
            paymentMethod,
            paymentDate,
            referenceNumber,
            notes,
            clientName,
            clientEmail,
            status // Add status field
        } = req.body;

        const updateData = {
            ...(amount && { amount: parseFloat(amount) }),
            ...(paymentMethod && { paymentMethod }),
            ...(paymentDate && { paymentDate: new Date(paymentDate) }),
            ...(referenceNumber && { referenceNumber }),
            ...(notes && { notes }),
            ...(clientName && { clientName }),
            ...(clientEmail && { clientEmail }),
            ...(status && { status }), // Add status to update data
            updatedAt: new Date()
        };

        const collection = await ReceiptModel.getCollection();
        const result = await collection.findOneAndUpdate(
            {
                _id: new ObjectId(id),
                companyId: companyId.toString()
            },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result.value) {
            return res.status(404).json({
                status: 'error',
                message: 'Receipt not found'
            });
        }

        res.json({
            status: 'success',
            data: result.value
        });
    } catch (error) {
        console.error('Error updating receipt:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Delete receipt
exports.deleteReceipt = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        
        if (!companyId) {
            return res.status(400).json({
                status: 'error',
                message: 'Company ID not found in user token'
            });
        }

        const id = req.params.id;
        const collection = await ReceiptModel.getCollection();
        const result = await collection.findOneAndDelete({
            _id: new ObjectId(id),
            companyId: companyId.toString()
        });

        if (!result.value) {
            return res.status(404).json({
                status: 'error',
                message: 'Receipt not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Receipt deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting receipt:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get receipts by invoice
exports.getReceiptsByInvoice = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        
        if (!companyId) {
            return res.status(400).json({
                status: 'error',
                message: 'Company ID not found in user token'
            });
        }

        const invoiceId = req.params.invoiceId;
        const collection = await ReceiptModel.getCollection();
        const receipts = await collection.find({
            invoiceId: invoiceId,
            companyId: companyId.toString()
        })
        .sort({ createdAt: -1 })
        .toArray();

        res.json({
            status: 'success',
            data: receipts
        });
    } catch (error) {
        console.error('Error getting receipts by invoice:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}; 