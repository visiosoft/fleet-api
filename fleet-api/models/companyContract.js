const mongoose = require('mongoose');

// Define contract status options
const CONTRACT_STATUS = {
    ACTIVE: 'Active',
    EXPIRED: 'Expired',
    PENDING: 'Pending',
    TERMINATED: 'Terminated',
    RENEWED: 'Renewed'
};

const companyContractSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    tradeLicenseNo: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    vehicleName: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(CONTRACT_STATUS),
        default: CONTRACT_STATUS.PENDING
    },
    documents: [{
        name: String,
        fileUrl: String,
        uploadDate: {
            type: Date,
            default: Date.now
        },
        fileType: String
    }],
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Create indexes for faster queries
companyContractSchema.index({ companyName: 1 });
companyContractSchema.index({ vehicleName: 1 });
companyContractSchema.index({ status: 1 });
companyContractSchema.index({ tradeLicenseNo: 1 });

// Add a method to check if contract is expired
companyContractSchema.methods.isExpired = function() {
    return new Date() > this.endDate;
};

// Add a method to get remaining days in contract
companyContractSchema.methods.getRemainingDays = function() {
    const today = new Date();
    const endDate = this.endDate;
    const diffTime = endDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Export the contract status enum along with the model
module.exports = {
    CompanyContract: mongoose.model('CompanyContract', companyContractSchema),
    CONTRACT_STATUS
}; 