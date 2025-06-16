const { getCollection } = require('../config/db');

const ReceiptModel = {
    async getCollection() {
        return await getCollection('receipts');
    },

    // Helper function to generate receipt number
    async generateReceiptNumber(companyId) {
        const collection = await this.getCollection();
        const count = await collection.countDocuments({ companyId });
        const timestamp = Date.now();
        return `RCP-${timestamp}-${count + 1}`;
    }
};

module.exports = ReceiptModel; 