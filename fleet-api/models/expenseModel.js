const { ObjectId } = require('mongodb');
const db = require('../config/db');

const COLLECTION_NAME = 'expenses';

/**
 * Expense schema definition (for documentation and validation)
 * In MongoDB we don't enforce this strictly, but this serves as a reference
 * 
 * {
 *   vehicleId: String,
 *   driverId: String,
 *   expenseType: String, // fuel, maintenance, etc.
 *   amount: Number,
 *   date: Date,
 *   description: String,
 *   paymentStatus: String, // pending, approved, rejected, paid
 *   paymentMethod: String, // cash, bank_transfer, credit_card, check, other
 *   notes: String,
 *   attachments: [
 *     {
 *       name: String,
 *       fileUrl: String,
 *       fileType: String,
 *       uploadedAt: Date
 *     }
 *   ],
 *   createdAt: Date,
 *   updatedAt: Date
 * }
 */

// Expense model 
const ExpenseModel = {
  /**
   * Validate expense data against our expected schema
   * @param {Object} data - Expense data to validate
   * @returns {Object} - Validation result {isValid, errors}
   */
  validate(data) {
    const errors = [];
    
    // Required fields
    if (!data.vehicleId && !data.driverId) errors.push('Either vehicleId or driverId is required');
    if (!data.expenseType) errors.push('Expense type is required');
    if (!data.amount) errors.push('Amount is required');
    if (!data.description) errors.push('Description is required');
    
    // Type validation
    if (data.amount && isNaN(Number(data.amount))) {
      errors.push('Amount must be a number');
    }
    
    if (data.date && !(new Date(data.date) instanceof Date)) {
      errors.push('Date must be a valid date');
    }
    
    // Enum validation
    const validExpenseTypes = [
      'fuel', 'maintenance', 'insurance', 'registration', 'tires', 'repairs',
      'salary', 'benefits', 'training', 'uniform', 'accommodation', 'food',
      'office', 'administrative', 'marketing', 'other'
    ];
    if (data.expenseType && !validExpenseTypes.includes(data.expenseType)) {
      errors.push(`Expense type must be one of: ${validExpenseTypes.join(', ')}`);
    }
    
    const validPaymentStatuses = ['pending', 'approved', 'rejected', 'paid'];
    if (data.paymentStatus && !validPaymentStatuses.includes(data.paymentStatus)) {
      errors.push(`Payment status must be one of: ${validPaymentStatuses.join(', ')}`);
    }
    
    const validPaymentMethods = ['cash', 'bank_transfer', 'credit_card', 'check', 'other'];
    if (data.paymentMethod && !validPaymentMethods.includes(data.paymentMethod)) {
      errors.push(`Payment method must be one of: ${validPaymentMethods.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  /**
   * Get MongoDB expense collection
   * @returns {Promise<Collection>} MongoDB collection
   */
  async getCollection() {
    return await db.getCollection(COLLECTION_NAME);
  },
  
  /**
   * Clean up expense data and prepare it for insertion
   * @param {Object} data - Expense data
   * @returns {Object} - Cleaned data
   */
  prepareData(data) {
    // Create a copy to avoid mutating the original
    const expense = { ...data };
    
    // Format amount as number
    if (expense.amount) {
      expense.amount = Number(expense.amount);
    }
    
    // Format date if it exists and is a string
    if (expense.date && typeof expense.date === 'string') {
      expense.date = new Date(expense.date);
    }
    
    // Set default values for missing fields
    if (!expense.paymentStatus) expense.paymentStatus = 'pending';
    if (!expense.paymentMethod) expense.paymentMethod = 'cash';
    if (!expense.date) expense.date = new Date();
    
    // Set timestamps
    expense.createdAt = new Date();
    expense.updatedAt = new Date();
    
    return expense;
  }
};

module.exports = ExpenseModel; 