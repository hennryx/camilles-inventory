// controllers/returns/returnsController.js
const Transaction = require('../../models/Transaction/TransactionSchema');
const Product = require('../../models/Products/ProductSchema');
const ProductBatch = require('../../models/Products/batch');

exports.getReturns = async (req, res) => {
    try {
        const returns = await Transaction.find({ transactionType: 'RETURN' })
            .populate('products.product')
            .populate('suppliers')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: returns.length,
            data: returns
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.saveReturn = async (req, res) => {
    try {
        const { products, notes, transactionType, createdBy } = req.body;
        
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No products specified for return'
            });
        }
        
        // Create the return transaction
        const returnTransaction = await Transaction.create({
            products,
            notes,
            transactionType,
            createdBy,
            suppliers: [] // Returns may not have associated suppliers
        });
        
        // Update product stock (increase stock for returned products)
        for (const item of products) {
            // Find the latest batch of this product to add the returned items
            const latestBatch = await ProductBatch.findOne({
                'products.product': item.product
            }).sort({ createdAt: -1 });
            
            if (latestBatch) {
                // Find the product in the batch
                const productIndex = latestBatch.products.findIndex(
                    p => p.product.toString() === item.product
                );
                
                if (productIndex !== -1) {
                    // Increase remaining stock
                    latestBatch.products[productIndex].remainingStock += item.quantity;
                    await latestBatch.save();
                }
            }
        }
        
        res.status(201).json({
            success: true,
            message: 'Return processed successfully',
            returnData: returnTransaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateReturn = async (req, res) => {
    try {
        const { _id, products, notes } = req.body;
        
        if (!_id) {
            return res.status(400).json({
                success: false,
                message: 'Return ID is required'
            });
        }
        
        // Find the existing return
        const existingReturn = await Transaction.findById(_id);
        
        if (!existingReturn) {
            return res.status(404).json({
                success: false,
                message: 'Return not found'
            });
        }
        
        // Revert previous stock adjustments
        for (const item of existingReturn.products) {
            const latestBatch = await ProductBatch.findOne({
                'products.product': item.product
            }).sort({ createdAt: -1 });
            
            if (latestBatch) {
                const productIndex = latestBatch.products.findIndex(
                    p => p.product.toString() === item.product.toString()
                );
                
                if (productIndex !== -1) {
                    // Decrease remaining stock (revert previous increase)
                    latestBatch.products[productIndex].remainingStock -= item.quantity;
                    await latestBatch.save();
                }
            }
        }
        
        // Update the return transaction
        existingReturn.products = products;
        existingReturn.notes = notes;
        await existingReturn.save();
        
        // Apply new stock adjustments
        for (const item of products) {
            const latestBatch = await ProductBatch.findOne({
                'products.product': item.product
            }).sort({ createdAt: -1 });
            
            if (latestBatch) {
                const productIndex = latestBatch.products.findIndex(
                    p => p.product.toString() === item.product.toString()
                );
                
                if (productIndex !== -1) {
                    // Increase remaining stock based on updated quantity
                    latestBatch.products[productIndex].remainingStock += item.quantity;
                    await latestBatch.save();
                }
            }
        }
        
        res.status(200).json({
            success: true,
            message: 'Return updated successfully',
            returnData: existingReturn
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteReturn = async (req, res) => {
    try {
        const { _id } = req.body;
        
        if (!_id) {
            return res.status(400).json({
                success: false,
                message: 'Return ID is required'
            });
        }
        
        // Find the return
        const returnToDelete = await Transaction.findById(_id);
        
        if (!returnToDelete) {
            return res.status(404).json({
                success: false,
                message: 'Return not found'
            });
        }
        
        // Revert stock adjustments
        for (const item of returnToDelete.products) {
            const latestBatch = await ProductBatch.findOne({
                'products.product': item.product
            }).sort({ createdAt: -1 });
            
            if (latestBatch) {
                const productIndex = latestBatch.products.findIndex(
                    p => p.product.toString() === item.product.toString()
                );
                
                if (productIndex !== -1) {
                    // Decrease remaining stock (revert the return)
                    latestBatch.products[productIndex].remainingStock -= item.quantity;
                    await latestBatch.save();
                }
            }
        }
        
        // Delete the return
        await Transaction.findByIdAndDelete(_id);
        
        res.status(200).json({
            success: true,
            message: 'Return deleted successfully',
            returnData: returnToDelete
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};