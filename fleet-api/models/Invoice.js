const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    }
});

const paymentSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['cash', 'bank_transfer', 'credit_card', 'check']
    },
    transactionId: String,
    notes: String,
    date: {
        type: Date,
        default: Date.now
    }
});

const invoiceSchema = new mongoose.Schema({
    contractId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract',
        required: true
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    issueDate: {
        type: Date,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    items: [invoiceItemSchema],
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    tax: {
        type: Number,
        required: false,
        min: 0,
        default: 0
    },
    includeVat: {
        type: Boolean,
        default: true
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    notes: String,
    status: {
        type: String,
        enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
        default: 'draft'
    },
    payments: [paymentSchema],
    sentAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
invoiceSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Calculate total amount before saving
invoiceSchema.pre('save', function(next) {
    if (this.items && this.items.length > 0) {
        this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
        this.total = this.includeVat ? this.subtotal + (this.tax || 0) : this.subtotal;
    }
    next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice; 