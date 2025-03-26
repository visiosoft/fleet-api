const { ObjectId } = require('mongodb');
const db = require('../config/db');

class PayrollEntry {
  constructor(data) {
    // Only set _id if it's provided in the data
    this._id = data._id || null;
    this.driverName = data.driverName || '';
    
    // Parse month and year from the month string (format: "YYYY-MM")
    const [year, month] = data.month.split('-');
    this.month = month;
    this.year = parseInt(year);
    
    this.baseSalary = parseFloat(data.baseSalary) || 0;
    this.overtimeHours = parseFloat(data.overtimeHours) || 0;
    this.overtimeRate = parseFloat(data.overtimeRate) || 0;
    this.bonuses = parseFloat(data.bonuses) || 0;
    this.deductions = parseFloat(data.deductions) || 0;
    this.paymentMethod = data.paymentMethod || 'bank_transfer';
    this.notes = data.notes || '';
    
    // Calculate total amount and net pay
    const overtimePay = this.overtimeHours * this.overtimeRate;
    this.totalAmount = this.baseSalary + overtimePay + this.bonuses;
    this.netPay = this.totalAmount - this.deductions;
    
    this.status = data.status || 'pending';
    this.paymentDate = data.paymentDate ? new Date(data.paymentDate) : null;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = new Date();
  }

  static async find(query = {}) {
    const collection = await db.getCollection('payrollentries');
    return collection.find(query);
  }

  static async findOne(query) {
    const collection = await db.getCollection('payrollentries');
    return collection.findOne(query);
  }

  static async findById(id) {
    return this.findOne({ _id: new ObjectId(id) });
  }

  async save() {
    const collection = await db.getCollection('payrollentries');
    console.log('Saving payroll entry:', this); // Debug log
    
    try {
      // For new entries (no _id or empty _id)
      if (!this._id || this._id.toString() === '') {
        console.log('Inserting new payroll entry'); // Debug log
        const result = await collection.insertOne(this);
        console.log('Insert result:', result); // Debug log
        this._id = result.insertedId;
      } else {
        // For existing entries
        this.updatedAt = new Date();
        console.log('Updating existing payroll entry with ID:', this._id); // Debug log
        const result = await collection.updateOne(
          { _id: this._id },
          { $set: this }
        );
        console.log('Update result:', result); // Debug log
      }
      return this;
    } catch (error) {
      console.error('Error saving payroll entry:', error);
      throw error;
    }
  }

  async remove() {
    const collection = await db.getCollection('payrollentries');
    return collection.deleteOne({ _id: this._id });
  }

  toJSON() {
    return {
      _id: this._id,
      driverName: this.driverName,
      month: this.month,
      year: this.year,
      baseSalary: this.baseSalary,
      overtimeHours: this.overtimeHours,
      overtimeRate: this.overtimeRate,
      bonuses: this.bonuses,
      deductions: this.deductions,
      totalAmount: this.totalAmount,
      netPay: this.netPay,
      paymentMethod: this.paymentMethod,
      notes: this.notes,
      status: this.status,
      paymentDate: this.paymentDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = PayrollEntry; 