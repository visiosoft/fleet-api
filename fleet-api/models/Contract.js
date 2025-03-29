const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/db');

const contractSchema = new mongoose.Schema({
    contractNumber: {
        type: String,
        required: true,
        unique: true
    },
    clientName: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'terminated', 'draft'],
        default: 'draft'
    },
    description: String,
    terms: String,
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
contractSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const Contract = mongoose.model('Contract', contractSchema);

const ContractModel = {
    async getCollection() {
        return await getCollection('contracts');
    },

    async findOne(query) {
        const collection = await this.getCollection();
        return await collection.findOne(query);
    }
};

module.exports = ContractModel; 