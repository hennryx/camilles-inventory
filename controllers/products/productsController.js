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

        const topProducts = await getTopSellingProductsThisMonth()
        res.status(200).json({
            success: true,
            totalItems,
            minimumStock,
            outStock,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            data: productsWithStock,
            topProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const getTopSellingProductsThisMonth = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const topProducts = await Transaction.aggregate([
        {
            $match: {
                transactionType: 'SALE',
                createdAt: {
                    $gte: startOfMonth,
                    $lt: endOfMonth
                }
            }
        },
        { $unwind: '$products' },
        {
            $group: {
                _id: '$products.product',
                totalSold: { $sum: '$products.quantity' }
            }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'productInfo'
            }
        },
        { $unwind: '$productInfo' },
        {
            $project: {
                productId: '$_id',
                name: '$productInfo.productName',
                totalSold: 1,
                image: '$productInfo.image',
                price: "$productInfo.sellingPrice"
            }
        }
    ]);

    return topProducts;
};


// Add new product
exports.addProduct = async (req, res) => {
    try {
        const { productName, unit, unitSize, sellingPrice, createdBy, category } = req.body;

        if (!productName || !unit || !unitSize || !sellingPrice) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const product = await Product.create({
            productName,
            image: req.file ? req.file.filename : null,
            unit,
            unitSize,
            sellingPrice,
            createdBy,
            category
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
        const { productName, unit, unitSize, sellingPrice, _id, category } = req.body;

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
        if (category) product.category = category;

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
 * @param {Number} quantity - Quantity to deduct from stock
 * @param {String} transactionType - transaction type if it's sale or other
 * @param {String} createdBy - createdBy for who made the transaction
 */
exports.deductProductStock = async (req, res) => {
    const { products, quantity, ...data } = req.body;

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
        const supplierIds = new Set();

        for (const productId of products) {
            remainingToDeduct = quantity;

            if (!mongoose.Types.ObjectId.isValid(productId)) {
                continue;
            }

            const batches = await ProductBatch.find({
                'products.product': productId,
                'products.remainingStock': { $gt: 0 }
            }).sort({ 'products.expiryDate': 1 });

            if (batches.length === 0) {
                console.log(`No available batches found for product ${productId}`);
                continue;
            }

            let deductedFromThisProduct = 0;

            for (const batch of batches) {
                if (remainingToDeduct <= 0) break;

                if (batch.supplier) {
                    supplierIds.add(batch.supplier.toString());
                }

                for (let i = 0; i < batch.products.length; i++) {
                    const item = batch.products[i];

                    if (item.product.toString() === productId && item.remainingStock > 0) {
                        const deduction = Math.min(item.remainingStock, remainingToDeduct);

                        item.remainingStock -= deduction;
                        remainingToDeduct -= deduction;
                        deductedFromThisProduct += deduction;

                        batch.markModified(`products.${i}.remainingStock`);

                        if (deduction > 0) {
                            deductionDetails.push({
                                productId,
                                batchId: batch._id,
                                expiryDate: item.expiryDate,
                                deducted: deduction,
                            });
                        }

                        if (remainingToDeduct <= 0) break;
                    }
                }

                await batch.save();

                if (remainingToDeduct <= 0) break;
            }

            if (deductedFromThisProduct > 0) {
                processedProducts.push({
                    product: productId,
                    quantity: deductedFromThisProduct,
                });
            }

            console.log(`Deducted ${deductedFromThisProduct} units from product ${productId}`);

        }

        const totalDeducted = quantity - remainingToDeduct;

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
            suppliers: Array.from(supplierIds),
            deductionDetails,
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