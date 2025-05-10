const Users = require("../../models/Users");
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Create a token and send email for password reset
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your email'
            });
        }

        // Check if user exists
        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with that email'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        // Set token expiration (1 hour)
        const resetExpire = Date.now() + 3600000;

        // Save token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = resetExpire;
        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        // Email content
        const message = `
            <h1>Password Reset Request</h1>
            <p>Please click the link below to reset your password:</p>
            <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request this, please ignore this email.</p>
        `;

        // Configure transporter
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Send email
        await transporter.sendMail({
            from: `${process.env.EMAIL_FROM || 'Password Reset'} <${process.env.EMAIL_USERNAME}>`,
            to: email,
            subject: 'Password Reset Request',
            html: message
        });

        res.status(200).json({
            success: true,
            message: 'Password reset email sent'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        
        // Cleanup failed reset attempt
        if (error.code === 'EAUTH' || error.code === 'ETIMEDOUT') {
            // If email sending failed, remove the token from DB
            await Users.findOneAndUpdate(
                { email: req.body.email },
                { resetPasswordToken: undefined, resetPasswordExpire: undefined }
            );
            
            return res.status(500).json({
                success: false,
                message: 'Email could not be sent. Please contact support.'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error while processing password reset'
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

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update password and clear reset fields
        user.password = hashedPassword;
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