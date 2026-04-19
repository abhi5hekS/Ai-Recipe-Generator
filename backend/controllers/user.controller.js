const User = require('../models/user');
const UserPreferences = require('../models/userPreferences');
const bcrypt = require('bcryptjs');

const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const preferences = await UserPreferences.findOne({ user: req.user.id });

        res.json({
            success: true,
            data: { user, preferences }
        });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const { name, email } = req.body;

        await User.updateOne(
            { _id: req.user.id },
            { $set: { name, email } }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

const updatePreferences = async (req, res, next) => {
    try {
        const preferences = await UserPreferences.findOneAndUpdate(
            { user_id: req.user.id },
            {
                $set: {
                    ...req.body,
                    user_id: req.user.id
                }
            },
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            data: preferences
        });

    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        next(error);
    }
};


const deleteAccount = async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.user.id);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile, updateProfile, updatePreferences, changePassword, deleteAccount
}