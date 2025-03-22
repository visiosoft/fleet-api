const CompanyProfile = require('../models/companyProfile');

// Get company profile
exports.getCompanyProfile = async (req, res) => {
    try {
        const profile = await CompanyProfile.findOne();
        if (!profile) {
            return res.status(404).json({ message: 'Company profile not found' });
        }
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create or update company profile
exports.updateCompanyProfile = async (req, res) => {
    try {
        const profile = await CompanyProfile.findOne();
        
        if (profile) {
            // Update existing profile
            const updatedProfile = await CompanyProfile.findByIdAndUpdate(
                profile._id,
                req.body,
                { new: true, runValidators: true }
            );
            return res.status(200).json(updatedProfile);
        } else {
            // Create new profile
            const newProfile = new CompanyProfile(req.body);
            const savedProfile = await newProfile.save();
            return res.status(201).json(savedProfile);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update company logo
exports.updateLogo = async (req, res) => {
    try {
        const profile = await CompanyProfile.findOne();
        if (!profile) {
            return res.status(404).json({ message: 'Company profile not found' });
        }

        profile.logo = {
            url: req.body.url,
            altText: req.body.altText,
            uploadDate: new Date()
        };

        const updatedProfile = await profile.save();
        res.status(200).json(updatedProfile);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update business hours
exports.updateBusinessHours = async (req, res) => {
    try {
        const profile = await CompanyProfile.findOne();
        if (!profile) {
            return res.status(404).json({ message: 'Company profile not found' });
        }

        profile.businessHours = req.body;
        const updatedProfile = await profile.save();
        res.status(200).json(updatedProfile);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update contact information
exports.updateContact = async (req, res) => {
    try {
        const profile = await CompanyProfile.findOne();
        if (!profile) {
            return res.status(404).json({ message: 'Company profile not found' });
        }

        profile.contact = {
            ...profile.contact,
            ...req.body
        };
        
        const updatedProfile = await profile.save();
        res.status(200).json(updatedProfile);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update social media links
exports.updateSocialMedia = async (req, res) => {
    try {
        const profile = await CompanyProfile.findOne();
        if (!profile) {
            return res.status(404).json({ message: 'Company profile not found' });
        }

        profile.socialMedia = {
            ...profile.socialMedia,
            ...req.body
        };
        
        const updatedProfile = await profile.save();
        res.status(200).json(updatedProfile);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update about information
exports.updateAbout = async (req, res) => {
    try {
        const profile = await CompanyProfile.findOne();
        if (!profile) {
            return res.status(404).json({ message: 'Company profile not found' });
        }

        profile.about = {
            ...profile.about,
            ...req.body
        };
        
        const updatedProfile = await profile.save();
        res.status(200).json(updatedProfile);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}; 