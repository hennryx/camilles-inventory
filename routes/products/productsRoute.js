const express = require('express');
const router = express.Router()

const { getAllProducts, addProduct, deleteProduct, updateProduct } = require('../../controllers/products/productsController');
const { protect } = require('../../middlewares/auth');
const { uploadMiddleware } = require('../../middlewares/uploadMiddleware');

router.get('/getAll', protect, getAllProducts);
router.post('/save', protect, uploadMiddleware, addProduct);
router.put('/update', protect, uploadMiddleware, updateProduct);
router.delete('/delete', protect, deleteProduct);

module.exports = router;