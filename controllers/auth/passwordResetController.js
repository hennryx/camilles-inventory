const Users = require("../../models/Users");
const bcrypt = require('bcryptjs');
const { sendPasswordResetEmail } = require('../../utils/emailService');
const crypto = require('crypto');

exports.forgotPassword = async (req, res) => {
    const { email, frontendUrl } = req.body;
    const user = await Users.findOne({ email });

    try {

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Set token expiry (10 minutes)
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        // Create reset URL
        const baseUrl = frontendUrl || process.env.FRONTEND_URL;
        const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

        await sendPasswordResetEmail(user.email, resetToken, resetUrl);

        res.status(200).json({
            success: true,
            message: 'Password reset email sent'
        });
    } catch (error) {
        console.error('Forgot password error:', error);

        // If there was an error, reset the token fields
        if (user) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
        }

        res.status(500).json({
            success: false,
            message: 'Email could not be sent',
            error: error.message
        });
    }
};

// Validate token and reset password
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: 'Missing required information'
            });
        }

        // Validate password
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // Find user with token and valid expiration
        const user = await Users.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while resetting password'
        });
    }
};