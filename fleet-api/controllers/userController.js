const { ObjectId } = require('mongodb');
const UserModel = require('../models/UserModel');

// Get all users with pagination
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const companyId = req.user.companyId;

        const users = await UserModel.find({ companyId: new ObjectId(companyId) }, {
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

        const total = await UserModel.countDocuments({ companyId: new ObjectId(companyId) });

        res.status(200).json({
            status: 'success',
            data: {
                users,
                total,
                page,
                limit
            }
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const user = await UserModel.findOne({ 
            _id: new ObjectId(req.params.userId),
            companyId: new ObjectId(companyId)
        });

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Create new user
const createUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            role,
            status,
            companyId
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !role || !status || !companyId) {
            return res.status(400).json({
                status: 'error',
                message: 'All fields are required'
            });
        }

        // Validate role
        const validRoles = ['admin', 'manager', 'user'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid role'
            });
        }

        // Validate status
        const validStatuses = ['active', 'inactive'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid status'
            });
        }

        // Check if user with same email exists in the same company
        const existingUser = await UserModel.findOne({ 
            email, 
            companyId: new ObjectId(companyId) 
        });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'User with this email already exists in your company'
            });
        }

        const user = {
            firstName,
            lastName,
            email,
            phone,
            role,
            status,
            companyId: new ObjectId(companyId),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await UserModel.insertOne(user);
        user._id = result.insertedId;

        res.status(201).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update user
const updateUser = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const user = await UserModel.findOne({ 
            _id: new ObjectId(req.params.userId),
            companyId: new ObjectId(companyId)
        });

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Check if email is being updated and if it's already taken in the same company
        if (req.body.email && req.body.email !== user.email) {
            const existingUser = await UserModel.findOne({ 
                email: req.body.email,
                companyId: new ObjectId(companyId)
            });
            if (existingUser) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email is already in use by another user in your company'
                });
            }
        }

        // Validate role if being updated
        if (req.body.role) {
            const validRoles = ['admin', 'manager', 'user'];
            if (!validRoles.includes(req.body.role)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid role'
                });
            }
        }

        // Validate status if being updated
        if (req.body.status) {
            const validStatuses = ['active', 'inactive'];
            if (!validStatuses.includes(req.body.status)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid status'
                });
            }
        }

        // Update only allowed fields
        const allowedUpdates = [
            'firstName',
            'lastName',
            'email',
            'phone',
            'role',
            'status'
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

        const result = await UserModel.updateOne(
            { _id: new ObjectId(req.params.userId), companyId: new ObjectId(companyId) },
            { $set: updates }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No updates were made'
            });
        }

        const updatedUser = await UserModel.findOne({ 
            _id: new ObjectId(req.params.userId),
            companyId: new ObjectId(companyId)
        });

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const user = await UserModel.findOne({ 
            _id: new ObjectId(req.params.userId),
            companyId: new ObjectId(companyId)
        });

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        await UserModel.deleteOne({ 
            _id: new ObjectId(req.params.userId),
            companyId: new ObjectId(companyId)
        });

        res.status(200).json({
            status: 'success',
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
}; 