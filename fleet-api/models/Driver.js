const { ObjectId } = require('mongodb');
const db = require('../config/db');

class Driver {
  constructor(data) {
    this._id = data._id || new ObjectId();
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.employeeId = data.employeeId || '';
    this.status = data.status || 'active';
    this.company = data.company ? new ObjectId(data.company) : null;
    this.contactNumber = data.contactNumber || '';
    this.email = data.email || '';
    this.licenseNumber = data.licenseNumber || '';
    this.licenseExpiry = data.licenseExpiry ? new Date(data.licenseExpiry) : null;
    this.address = data.address || {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    };
    this.joiningDate = data.joiningDate ? new Date(data.joiningDate) : new Date();
    this.notes = data.notes || '';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = new Date();
  }

  static async find(query = {}) {
    const collection = await db.getCollection('drivers');
    return collection.find(query);
  }

  static async findOne(query) {
    const collection = await db.getCollection('drivers');
    return collection.findOne(query);
  }

  static async findById(id) {
    return this.findOne({ _id: new ObjectId(id) });
  }

  async save() {
    const collection = await db.getCollection('drivers');
    if (this._id) {
      this.updatedAt = new Date();
      await collection.updateOne(
        { _id: this._id },
        { $set: this }
      );
    } else {
      const result = await collection.insertOne(this);
      this._id = result.insertedId;
    }
    return this;
  }

  async remove() {
    const collection = await db.getCollection('drivers');
    return collection.deleteOne({ _id: this._id });
  }

  toJSON() {
    return {
      _id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      employeeId: this.employeeId,
      status: this.status,
      company: this.company,
      contactNumber: this.contactNumber,
      email: this.email,
      licenseNumber: this.licenseNumber,
      licenseExpiry: this.licenseExpiry,
      address: this.address,
      joiningDate: this.joiningDate,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Driver; 