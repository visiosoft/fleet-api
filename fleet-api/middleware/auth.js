const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');

const auth = async (req, res, next) => {
    // Allow all requests without authentication
    next();
};

const checkRole = (...roles) => {
    return (req, res, next) => {
        next();
    };
};

const checkCompanyAccess = async (req, res, next) => {
    next();
};

module.exports = {
    auth,
    checkRole,
    checkCompanyAccess
}; 