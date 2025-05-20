const { ObjectId } = require('mongodb');
const CompanyModel = require('../models/companyModel');
const UserModel = require('../models/UserModel');

// Get all companies
const getCompanies = async (req, res) => {
    try {
        const companies = await CompanyModel.find({});
        res.status(200).json({
            status: 'success',
            data: {
                companies
            }
        });
    } catch (error) {
        console.error('Error getting companies:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get company by ID
const getCompanyById = async (req, res) => {
    try {
        const company = await CompanyModel.findOne({ _id: new ObjectId(req.params.id) });

        if (!company) {
            return res.status(404).json({
                status: 'error',
                message: 'Company not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                company
            }
        });
    } catch (error) {
        console.error('Error getting company:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Create new company
const createCompany = async (req, res) => {
    try {
        const {
            name,
            address,
            phone,
            email,
            licenseNumber,
            currency
        } = req.body;

        // Validate required fields
        if (!name || !address || !phone || !email || !licenseNumber || !currency) {
            return res.status(400).json({
                status: 'error',
                message: 'All fields are required'
            });
        }

        // Check if company with same license number exists
        const existingCompany = await CompanyModel.findOne({ licenseNumber });
        if (existingCompany) {
            return res.status(400).json({
                status: 'error',
                message: 'Company with this license number already exists'
            });
        }

        const company = {
            name,
            address,
            phone,
            email,
            licenseNumber,
            currency,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await CompanyModel.insertOne(company);
        company._id = result.insertedId;

        res.status(201).json({
            status: 'success',
            data: {
                company
            }
        });
    } catch (error) {
        console.error('Error creating company:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update company
const updateCompany = async (req, res) => {
    try {
        const company = await CompanyModel.findOne({ _id: new ObjectId(req.params.id) });

        if (!company) {
            return res.status(404).json({
                status: 'error',
                message: 'Company not found'
            });
        }

        // Check if license number is being updated and if it's already taken
        if (req.body.licenseNumber && req.body.licenseNumber !== company.licenseNumber) {
            const existingCompany = await CompanyModel.findOne({ licenseNumber: req.body.licenseNumber });
            if (existingCompany) {
                return res.status(400).json({
                    status: 'error',
                    message: 'License number is already in use by another company'
                });
            }
        }

        // Update only allowed fields
        const allowedUpdates = [
            'name',
            'address',
            'phone',
            'email',
            'licenseNumber',
            'currency'
        ];

        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No valid fields to update'
            });
        }

        updates.updatedAt = new Date();

        const result = await CompanyModel.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updates }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No updates were made'
            });
        }

        const updatedCompany = await CompanyModel.findOne({ _id: new ObjectId(req.params.id) });

        res.status(200).json({
            status: 'success',
            data: {
                company: updatedCompany
            }
        });
    } catch (error) {
        console.error('Error updating company:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Delete company
const deleteCompany = async (req, res) => {
    try {
        const company = await CompanyModel.findOne({ _id: new ObjectId(req.params.id) });

        if (!company) {
            return res.status(404).json({
                status: 'error',
                message: 'Company not found'
            });
        }

        await CompanyModel.deleteOne({ _id: new ObjectId(req.params.id) });

        res.status(200).json({
            status: 'success',
            message: 'Company deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting company:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get users by company ID
const getCompanyUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const companyId = req.params.id;

        // Verify company exists
        const company = await CompanyModel.findOne({ _id: new ObjectId(companyId) });
        if (!company) {
            return res.status(404).json({
                status: 'error',
                message: 'Company not found'
            });
        }

        // Check if user has access to this company
        if (req.user.companyId !== companyId && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. You can only view users from your own company.'
            });
        }

        // Build query based on user role
        const query = { companyId: new ObjectId(companyId) };
        if (req.user.role !== 'admin') {
            // Non-admin users can only see active users
            query.status = 'active';
        }

        const users = await UserModel.find(query, {
            projection: {
                firstName: 1,
                lastName: 1,
                email: 1,
                phone: 1,
                role: 1,
                status: 1,
                companyId: 1,
                createdAt: 1,
                updatedAt: 1
            },
            sort: { createdAt: -1 },
            skip: skip,
            limit: limit
        });

        const total = await UserModel.countDocuments(query);

        res.status(200).json({
            status: 'success',
            data: {
                users,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error getting company users:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

module.exports = {
    getCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
    getCompanyUsers
}; 