const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users/Users')

router.use('/auth', authRoutes); 

router.use('/users', userRoutes); 

module.exports = router;