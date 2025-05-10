// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { login, register, logout, provideToken } = require('../controllers/authControllers');
const { getAllUsers } = require('../controllers/users/usersController');
const { forgotPassword, resetPassword } = require('../controllers/auth/passwordResetController');

// Login user
router.post('/login', login);
router.post('/signup', register);
router.post('/logout', protect, logout)
router.get('/validateToken', protect, provideToken)

// Password reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Get all users - admin only
router.get('/users', protect, authorize('admin'), getAllUsers);

module.exports = router;