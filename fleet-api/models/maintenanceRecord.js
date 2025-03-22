const mongoose = require('mongoose');

// Define maintenance status options
const MAINTENANCE_STATUS = {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    SCHEDULED: 'Scheduled'
};

const maintenanceRecordSchema = new mongoose.Schema({
    vehicleName: {
        type: String,
        required: true,
        trim: true
    },
    service: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(MAINTENANCE_STATUS),
        default: MAINTENANCE_STATUS.PENDING
    },
    mileage: {
        type: Number,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    technician: {
        type: String,
        required: true
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Create an index on vehicleName for faster queries
maintenanceRecordSchema.index({ vehicleName: 1 });
// Create an index on status for faster queries
maintenanceRecordSchema.index({ status: 1 });

// Export the maintenance status enum along with the model
module.exports = {
    MaintenanceRecord: mongoose.model('MaintenanceRecord', maintenanceRecordSchema),
    MAINTENANCE_STATUS
}; 