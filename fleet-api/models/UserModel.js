const { getCollection } = require('../config/db');

const UserModel = {
    async getCollection() {
        return await getCollection('users');
    },

    async findOne(query) {
        const collection = await this.getCollection();
        return await collection.findOne(query);
    },

    async find(query, options = {}) {
        const collection = await this.getCollection();
        return await collection.find(query, options).toArray();
    },

    async countDocuments(query = {}) {
        const collection = await this.getCollection();
        return await collection.countDocuments(query);
    },

    async insertOne(document) {
        const collection = await this.getCollection();
        return await collection.insertOne(document);
    },

    async updateOne(query, update) {
        const collection = await this.getCollection();
        return await collection.updateOne(query, update);
    },

    async deleteOne(query) {
        const collection = await this.getCollection();
        return await collection.deleteOne(query);
    }
};

module.exports = UserModel; 