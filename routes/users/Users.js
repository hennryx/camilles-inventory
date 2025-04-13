const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middlewares/auth');
const { getAllUsers } = require('../../controllers/users/users');

// Get all users - admin only
router.get('/getAll', protect, authorize('ADMIN'), getAllUsers);

module.exports = router;