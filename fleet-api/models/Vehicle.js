const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    make: {
        type: String,
        required: true,
        trim: true
    },
    model: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: Number,
        required: true
    },
    licensePlate: {
        type: String,
        required: true,
        trim: true
    },
    vin: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['car', 'truck', 'van', 'motorcycle', 'other']
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'maintenance', 'out of service'],
        default: 'active'
    },
    mileage: {
        type: Number,
        required: true,
        default: 0
    },
    lastService: {
        type: Date,
        required: true
    },
    nextServiceDue: {
        type: Date,
        required: true
    },
    fuelType: {
        type: String,
        required: true,
        enum: ['gasoline', 'diesel', 'electric', 'hybrid']
    },
    fuelCapacity: {
        type: Number,
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    maintenance: [{
        date: {
            type: Date,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        cost: {
            type: Number,
            required: true
        },
        performedBy: {
            type: String,
            required: true
        },
        notes: String
    }],
    documents: [{
        type: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        uploadDate: {
            type: Date,
            default: Date.now
        },
        expiryDate: Date
    }],
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
vehicleSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle; 