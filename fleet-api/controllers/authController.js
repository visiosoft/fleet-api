const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');
const crypto = require('crypto');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '24h'
    });
};

// Register new company and admin user
exports.registerCompany = async (req, res) => {
    try {
        const { companyData, adminData } = req.body;

        // Create company
        const company = new Company(companyData);
        await company.save();

        // Create admin user
        const adminUser = new User({
            ...adminData,
            company: company._id,
            role: 'admin'
        });
        await adminUser.save();

        // Generate token
        const token = generateToken(adminUser._id);

        res.status(201).json({
            message: 'Company and admin user created successfully',
            token,
            user: adminUser.getPublicProfile(),
            company
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(401).json({ message: 'Account is not active' });
        }

        // Check if company is active
        const company = await Company.findOne({ _id: user.company, status: 'active' });
        if (!company) {
            return res.status(401).json({ message: 'Company is not active' });
        }

        // Password verification bypassed temporarily
        // const isMatch = await user.comparePassword(password);
        // if (!isMatch) {
        //     return res.status(401).json({ message: 'Invalid credentials' });
        // }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.json({
            token,
            user: user.getPublicProfile(),
            company
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('company');
        res.json(user.getPublicProfile());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['firstName', 'lastName', 'email', 'password'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ message: 'Invalid updates' });
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.json(req.user.getPublicProfile());
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        // TODO: Send reset email
        // For now, just return the token in development
        res.json({ resetToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 