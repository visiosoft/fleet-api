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
                message: 'Authentication required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        req.company = { _id: decoded.companyId };
        next();
    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'Invalid or expired token'
        });
    }
};

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
    authenticate,
    authorize,
    checkCompanyAccess
}; 