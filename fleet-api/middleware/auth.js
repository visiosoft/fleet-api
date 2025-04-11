const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const db = require('../config/db');

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
            
            // Store decoded token info in request
            req.user = decoded;
            
            // Add convenience methods to check company access
            req.hasCompanyAccess = (companyId) => {
                if (!companyId) return false;
                const tokenCompanyId = decoded.companyId;
                return tokenCompanyId === companyId.toString();
            };
            
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
        
        if (requestedCompanyId && !req.hasCompanyAccess(requestedCompanyId)) {
            return res.status(403).json({ 
                status: 'error',
                message: 'Access denied to this company' 
            });
        }
        
        next();
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: 'Error checking company access',
            error: error.message
        });
    }
};

module.exports = {
    auth,
    authorize,
    checkCompanyAccess,
    authenticate
}; 