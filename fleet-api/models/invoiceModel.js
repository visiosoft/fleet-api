const { getCollection } = require('../config/db');

const InvoiceModel = {
    async getCollection() {
        return await getCollection('invoices');
    }
};

module.exports = InvoiceModel; 