const { MaintenanceRecord, MAINTENANCE_STATUS } = require('../models/maintenanceRecord');

// Get all maintenance records
exports.getAllMaintenanceRecords = async (req, res) => {
    try {
        const records = await MaintenanceRecord.find();
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get unique vehicle names for dropdown
exports.getUniqueVehicles = async (req, res) => {
    try {
        const vehicles = await MaintenanceRecord.distinct('vehicleName');
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get available maintenance statuses
exports.getMaintenanceStatuses = async (req, res) => {
    try {
        res.status(200).json(Object.values(MAINTENANCE_STATUS));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get maintenance records by status
exports.getMaintenanceRecordsByStatus = async (req, res) => {
    try {
        const records = await MaintenanceRecord.find({ 
            status: { $regex: new RegExp(req.params.status, 'i') }
        });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get maintenance records count by status
exports.getMaintenanceStatusCount = async (req, res) => {
    try {
        const statusCount = await MaintenanceRecord.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        res.status(200).json(statusCount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a specific maintenance record by ID
exports.getMaintenanceRecordById = async (req, res) => {
    try {
        const record = await MaintenanceRecord.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }
        res.status(200).json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new maintenance record
exports.createMaintenanceRecord = async (req, res) => {
    try {
        const newRecord = new MaintenanceRecord({
            vehicleName: req.body.vehicleName,
            service: req.body.service,
            date: req.body.date,
            status: req.body.status || MAINTENANCE_STATUS.PENDING,
            mileage: req.body.mileage,
            cost: req.body.cost,
            technician: req.body.technician,
            notes: req.body.notes
        });
        const savedRecord = await newRecord.save();
        res.status(201).json(savedRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update maintenance status
exports.updateMaintenanceStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!Object.values(MAINTENANCE_STATUS).includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const updatedRecord = await MaintenanceRecord.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!updatedRecord) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }
        res.status(200).json(updatedRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a maintenance record
exports.updateMaintenanceRecord = async (req, res) => {
    try {
        const updatedRecord = await MaintenanceRecord.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedRecord) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }
        res.status(200).json(updatedRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a maintenance record
exports.deleteMaintenanceRecord = async (req, res) => {
    try {
        const deletedRecord = await MaintenanceRecord.findByIdAndDelete(req.params.id);
        if (!deletedRecord) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }
        res.status(200).json({ message: 'Maintenance record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get maintenance records by vehicle name
exports.getMaintenanceRecordsByVehicle = async (req, res) => {
    try {
        const records = await MaintenanceRecord.find({ 
            vehicleName: { $regex: new RegExp(req.params.vehicleId, 'i') }
        });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get maintenance records by service type
exports.getMaintenanceRecordsByService = async (req, res) => {
    try {
        const records = await MaintenanceRecord.find({ 
            service: { $regex: new RegExp(req.params.serviceType, 'i') }
        });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get maintenance cost statistics
exports.getMaintenanceCostStats = async (req, res) => {
    try {
        const stats = await MaintenanceRecord.aggregate([
            {
                $group: {
                    _id: null,
                    totalCost: { $sum: '$cost' },
                    averageCost: { $avg: '$cost' },
                    maxCost: { $max: '$cost' },
                    minCost: { $min: '$cost' },
                    count: { $sum: 1 }
                }
            }
        ]);
        res.status(200).json(stats[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 