const express = require('express');
const router = express.Router();
const companyProfileController = require('../controllers/companyProfileController');

// GET /api/company-profile - Get company profile
router.get('/', companyProfileController.getCompanyProfile);

// PUT /api/company-profile - Create or update company profile
router.put('/', companyProfileController.updateCompanyProfile);

// PATCH /api/company-profile/logo - Update company logo
router.patch('/logo', companyProfileController.updateLogo);

// PATCH /api/company-profile/business-hours - Update business hours
router.patch('/business-hours', companyProfileController.updateBusinessHours);

// PATCH /api/company-profile/contact - Update contact information
router.patch('/contact', companyProfileController.updateContact);

// PATCH /api/company-profile/social-media - Update social media links
router.patch('/social-media', companyProfileController.updateSocialMedia);

// PATCH /api/company-profile/about - Update about information
router.patch('/about', companyProfileController.updateAbout);

module.exports = router; 