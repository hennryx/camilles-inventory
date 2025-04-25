const mongoose = require("mongoose");
const Product = require('../../models/Products/ProductSchema');
const ProductBatch = require("../../models/Products/batch");
const Transaction = require("../../models/Transaction/TransactionSchema");
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

/**
 * Deduct product stock using FEFO (First Expire First Out)
 * @param {String} productId - Product _id
 * @param {Number} quantityToDeduct - Quantity to deduct from stock
 */
exports.deductProductStock = async (req, res) => {
    const { products, quantity, ...data } = req.body;

    // Input validation
    if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid products array" });
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({ success: false, message: "Invalid quantity. Must be a positive number" });
    }

    try {
        const deductionDetails = [];
        const processedProducts = [];
        let remainingToDeduct = 0;

        // Process each product ID in the request
        for (const productId of products) {
            remainingToDeduct = quantity;

            if (!mongoose.Types.ObjectId.isValid(productId)) {
                continue; // Skip invalid product IDs
            }

            // Find batches of this product ordered by expiry date (FEFO - First Expire, First Out)
            const batches = await ProductBatch.find({
                'products.product': productId,
                'products.remainingStock': { $gt: 0 }
            }).sort({ 'products.expiryDate': 1 });

            if (batches.length === 0) {
                console.log(`No available batches found for product ${productId}`);
                continue; // No available stock for this product, try next product
            }

            // Track how much we deduct from this specific product
            let deductedFromThisProduct = 0;

            // Process each batch starting with the earliest expiry date
            for (const batch of batches) {
                if (remainingToDeduct <= 0) break;

                for (let i = 0; i < batch.products.length; i++) {
                    const item = batch.products[i];

                    // If this item matches our product and has stock
                    if (item.product.toString() === productId && item.remainingStock > 0) {
                        // Calculate how much to deduct from this batch
                        const deduction = Math.min(item.remainingStock, remainingToDeduct);

                        // Update the remaining stock
                        item.remainingStock -= deduction;
                        remainingToDeduct -= deduction;
                        deductedFromThisProduct += deduction;

                        // Mark this path as modified to ensure mongoose saves the change
                        batch.markModified(`products.${i}.remainingStock`);

                        // Track what was deducted for the response
                        if (deduction > 0) {
                            deductionDetails.push({
                                productId,
                                batchId: batch._id,
                                expiryDate: item.expiryDate,
                                deducted: deduction
                            });
                        }

                        if (remainingToDeduct <= 0) break;
                    }
                }

                // Save the batch changes
                await batch.save();

                if (remainingToDeduct <= 0) break;
            }

            if (deductedFromThisProduct > 0) {
                processedProducts.push({
                    product: productId,
                    quantity: deductedFromThisProduct
                });
            }

            console.log(`Deducted ${deductedFromThisProduct} units from product ${productId}`);

        }

        const totalDeducted = quantity - remainingToDeduct;

        // No stock could be deducted
        if (totalDeducted === 0) {
            return res.status(400).json({
                success: false,
                message: "Unable to deduct stock. No available inventory.",
                debug: {
                    requestedProducts: products,
                    requestedQuantity: quantity
                }
            });
        }

        await Transaction.create({
            ...data,
            products: processedProducts,
            deductionDetails
        });

        const _products = await Product.find()
            .limit(5)
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

        const productsWithStock = _products.map(prod => ({
            ...prod,
            inStock: stockMap[prod._id.toString()] || 0
        }));

        // Return success response
        return res.status(200).json({
            success: true,
            message: `Successfully deducted ${totalDeducted} unit(s).`,
            data: productsWithStock
        });

    } catch (error) {
        console.error("Stock deduction error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "An error occurred while processing stock deduction",
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};