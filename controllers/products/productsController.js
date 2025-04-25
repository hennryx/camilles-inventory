const Product = require('../../models/Products/ProductSchema');
const ProductBatch = require("../../models/Products/batch")
const path = require('path');
const fs = require('fs');

exports.getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        let query = {};
        if (search) {
            query = {
                $or: [
                    { productName: { $regex: search, $options: 'i' } },
                    { unit: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const totalItems = await Product.countDocuments(query);

        const products = await Product.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();
        const stockData = await ProductBatch.aggregate([
            { $unwind: '$products' },
            {
                $group: {
                    _id: '$products.product',
                    totalStock: { $sum: '$products.remainingStock' }
                }
            }
        ]);

        const stockMap = {};
        stockData.forEach(item => {
            stockMap[item._id.toString()] = item.totalStock;
        });

        const productsWithStock = products.map(prod => ({
            ...prod,
            inStock: stockMap[prod._id.toString()] || 0
        }));

        const minimumStock = productsWithStock.filter(p => p.inStock <= 10).length;

        const outStock = productsWithStock.filter(p => p.inStock === 0).length;

        res.status(200).json({
            success: true,
            totalItems,
            minimumStock,
            outStock,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            data: productsWithStock
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Add new product
exports.addProduct = async (req, res) => {
    try {
        // Destructure fields from the request body
        const { productName, unit, unitSize, sellingPrice, inStock, createdBy } = req.body;

        // Validate required fields
        if (!productName || !unit || !unitSize || !sellingPrice) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }


        // Save file path/name in database
        const product = await Product.create({
            productName,
            image: req.file ? req.file.filename : null, // Store filename
            unit,
            unitSize,
            sellingPrice,
            inStock: inStock || 0,
            createdBy
        });

        res.status(201).json({
            success: true,
            message: "Product added successfully!",
            product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

// Update product
exports.updateProduct = async (req, res) => {
    try {
        // Update other fields
        const { productName, unit, unitSize, sellingPrice, inStock, _id } = req.body;

        // Find existing product
        const product = await Product.findById(_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check if new image is uploaded
        if (req.file) {
            // Delete old image if exists
            if (product.image) {
                const oldImagePath = path.join(__dirname, '../../assets/products', product.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            // Update with new image
            product.image = req.file.filename;
        }

        if (productName) product.productName = productName;
        if (unit) product.unit = unit;
        if (unitSize) product.unitSize = unitSize;
        if (sellingPrice) product.sellingPrice = sellingPrice;
        if (inStock !== undefined) product.inStock = inStock;

        await product.save();

        res.status(200).json({
            success: true,
            message: "Product updated successfully!",
            product
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const { _id } = req.body;

        const product = await Product.findById(_id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Delete product image if exists
        if (product.image) {
            const imagePath = path.join(__dirname, '../../assets/products', product.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Product.findByIdAndDelete(_id);

        res.status(200).json({
            product: product,
            success: true,
            message: "Product deleted successfully!"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}