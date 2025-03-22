const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    logo: {
        url: String,
        altText: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    },
    address: {
        street: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        state: {
            type: String,
            required: true,
            trim: true
        },
        country: {
            type: String,
            required: true,
            trim: true
        },
        postalCode: {
            type: String,
            required: true,
            trim: true
        }
    },
    contact: {
        phone: [{
            type: String,
            required: true,
            trim: true
        }],
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
        },
        website: {
            type: String,
            trim: true
        },
        fax: {
            type: String,
            trim: true
        }
    },
    registration: {
        registrationNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        taxId: {
            type: String,
            required: true,
            trim: true
        },
        establishmentDate: {
            type: Date,
            required: true
        }
    },
    socialMedia: {
        facebook: String,
        twitter: String,
        linkedin: String,
        instagram: String
    },
    businessHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
    },
    about: {
        description: {
            type: String,
            trim: true
        },
        mission: {
            type: String,
            trim: true
        },
        vision: {
            type: String,
            trim: true
        }
    }
}, {
    timestamps: true
});

// Ensure only one company profile can exist
companyProfileSchema.index({}, { unique: true });

module.exports = mongoose.model('CompanyProfile', companyProfileSchema); 