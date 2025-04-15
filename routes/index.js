const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users/userRoutes')
const suppliersRoutes = require('./suppliers/suppliersRoutes')

router.use('/auth', authRoutes); 

router.use('/users', userRoutes); 

router.use("/suppliers", suppliersRoutes)

module.exports = router;