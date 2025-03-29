const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');

// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'No authentication token provided'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            req.user = decoded;
            req.company = { _id: decoded.companyId };
            next();
        } catch (error) {
            res.status(401).json({
                status: 'error',
                message: 'Invalid authentication token'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Alias for backward compatibility
const auth = authenticate;

// Authorization middleware
const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
            });
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
    authorize,
    checkCompanyAccess,
    authenticate
}; 