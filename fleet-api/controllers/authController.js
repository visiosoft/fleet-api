const User = require('../models/User');
const Company = require('../models/Company');

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

        res.status(201).json({
            message: 'Company and admin user created successfully',
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
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({
            user: user.getPublicProfile(),
            company: await Company.findById(user.company)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('company');
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
        const user = await User.findById(req.params.id);
        updates.forEach(update => user[update] = req.body[update]);
        await user.save();
        res.json(user.getPublicProfile());
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}; 