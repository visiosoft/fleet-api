const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.userId, status: 'active' });

        if (!user) {
            throw new Error();
        }

        // Check if user's company is active
        const company = await Company.findOne({ _id: user.company, status: 'active' });
        if (!company) {
            throw new Error('Company is inactive or suspended');
        }

        // Check subscription status
        if (company.subscription.status !== 'active') {
            throw new Error('Company subscription is not active');
        }

        req.token = token;
        req.user = user;
        req.company = company;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

const checkRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};

const checkCompanyAccess = async (req, res, next) => {
    try {
        // For company-specific routes, verify the user belongs to the requested company
        const requestedCompanyId = req.params.companyId || req.body.companyId;
        
        if (requestedCompanyId && requestedCompanyId !== req.user.company.toString()) {
            return res.status(403).json({ message: 'Access denied to this company' });
        }
        
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error checking company access' });
    }
};

module.exports = {
    auth,
    checkRole,
    checkCompanyAccess
}; 