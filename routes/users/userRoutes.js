const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middlewares/auth');
const { getAllUsers, updateUser, deleteUser, updateProfile, updatePassword } = require('../../controllers/users/usersController');
const { uploadProfileImage } = require('../../middlewares/profileUploadMiddleware');

// Get all users - admin only
router.get('/getAll', protect, authorize('ADMIN'), getAllUsers);
router.delete('/delete', protect, deleteUser);
router.put('/update', protect, updateUser);

// Profile routes
router.put('/update-profile', protect, uploadProfileImage, updateProfile);
router.put('/update-password', protect, updatePassword);

module.exports = router;