const User = require('../models/User');
const Company = require('../models/Company');
const bcrypt = require('bcryptjs');

const userController = {
    /**
     * Get all users for the company
     */
    async getCompanyUsers(req, res) {
        try {
            const users = await User.find({ company: req.company._id })
                .select('-password')
                .sort({ createdAt: -1 });

            res.json({
                status: 'success',
                data: users
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch users',
                error: error.message
            });
        }
    },

    /**
     * Create a new user for the company
     */
    async createUser(req, res) {
        try {
            // Check if email already exists
            const existingUser = await User.findOne({ email: req.body.email });
            if (existingUser) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email already exists'
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            const user = new User({
                ...req.body,
                password: hashedPassword,
                company: req.company._id
            });

            await user.save();

            // Remove password from response
            const userResponse = user.toObject();
            delete userResponse.password;

            res.status(201).json({
                status: 'success',
                data: userResponse
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Failed to create user',
                error: error.message
            });
        }
    },

    /**
     * Update a user
     */
    async updateUser(req, res) {
        try {
            const user = await User.findOne({
                _id: req.params.id,
                company: req.company._id
            });

            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            // If password is being updated, hash it
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            }

            // Update fields
            Object.keys(req.body).forEach(key => {
                if (key !== 'company') {
                    user[key] = req.body[key];
                }
            });

            await user.save();

            // Remove password from response
            const userResponse = user.toObject();
            delete userResponse.password;

            res.json({
                status: 'success',
                data: userResponse
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Failed to update user',
                error: error.message
            });
        }
    },

    /**
     * Delete a user
     */
    async deleteUser(req, res) {
        try {
            const user = await User.findOne({
                _id: req.params.id,
                company: req.company._id
            });

            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            await user.remove();

            res.json({
                status: 'success',
                message: 'User deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Failed to delete user',
                error: error.message
            });
        }
    },

    /**
     * Get user by ID
     */
    async getUserById(req, res) {
        try {
            const user = await User.findOne({
                _id: req.params.id,
                company: req.company._id
            }).select('-password');

            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            res.json({
                status: 'success',
                data: user
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch user',
                error: error.message
            });
        }
    }
};

module.exports = userController; 