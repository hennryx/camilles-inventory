const express = require('express');
const { getAllSuppliers } = require('../../controllers/suppliers/suppliersControllers');
const { protect } = require('../../middlewares/auth');
const router = express.Router()

router.get('/getAll', protect, getAllSuppliers)

module.exports = router;