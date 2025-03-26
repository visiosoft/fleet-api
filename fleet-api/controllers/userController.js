const User = require('../models/User');
const Company = require('../models/Company');

const userController = {
    /**
     * Get all users for the company
     */
    async getCompanyUsers(req, res) {
        try {
            const users = await User.find({ company: req.company._id })
                .select('-password -resetPasswordToken -resetPasswordExpires');
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * Create a new user for the company
     */
    async createUser(req, res) {
        try {
            const { firstName, lastName, email, password, role } = req.body;

            // Check if email already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            // Create new user
            const user = new User({
                firstName,
                lastName,
                email,
                password,
                role: role || 'user',
                company: req.company._id
            });

            await user.save();
            res.status(201).json(user.getPublicProfile());
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    /**
     * Update a user
     */
    async updateUser(req, res) {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['firstName', 'lastName', 'email', 'role', 'status'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        try {
            const user = await User.findOne({
                _id: req.params.id,
                company: req.company._id
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            updates.forEach(update => user[update] = req.body[update]);
            await user.save();
            res.json(user.getPublicProfile());
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    /**
     * Delete a user
     */
    async deleteUser(req, res) {
        try {
            const user = await User.findOneAndDelete({
                _id: req.params.id,
                company: req.company._id
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
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
            }).select('-password -resetPasswordToken -resetPasswordExpires');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = userController; 