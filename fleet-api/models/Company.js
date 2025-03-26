const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
    },
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'basic', 'premium', 'enterprise'],
            default: 'free'
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'suspended', 'cancelled'],
            default: 'active'
        },
        startDate: Date,
        endDate: Date,
        autoRenew: {
            type: Boolean,
            default: true
        }
    },
    settings: {
        timezone: {
            type: String,
            default: 'UTC'
        },
        currency: {
            type: String,
            default: 'USD'
        },
        dateFormat: {
            type: String,
            default: 'MM/DD/YYYY'
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: true
            }
        }
    },
    logo: {
        url: String,
        altText: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
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
companySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company; 