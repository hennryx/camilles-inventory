const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const mongoose = require('mongoose');

/**
 * Process a new purchase and update product inventory with batch information
 * @param {string} purchaseId - The ID of the purchase to process
 */
exports.processPurchase = async (purchaseId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        // Find the purchase and populate product details
        const purchase = await Purchase.findById(purchaseId).session(session);
        
        if (!purchase) {
            throw new Error('Purchase not found');
        }
        
        if (purchase.status === 'processed') {
            throw new Error('This purchase has already been processed');
        }
        
        // Process each item in the purchase
        for (const item of purchase.items) {
            const product = await Product.findById(item.product).session(session);
            
            if (!product) {
                throw new Error(`Product with ID ${item.product} not found`);
            }
            
            // Add new batch to product
            product.batches.push({
                batchNumber: item.batchNumber,
                quantity: item.quantity,
                expiryDate: item.expiryDate,
                purchaseDate: purchase.purchaseDate,
                pricePerUnit: item.pricePerUnit,
                purchaseId: purchase._id
            });
            
            await product.save({ session });
        }
        
        // Mark purchase as processed
        purchase.status = 'processed';
        await purchase.save({ session });
        
        // Commit the transaction
        await session.commitTransaction();
        session.endSession();
        
        return { success: true, message: 'Purchase processed successfully' };
    } catch (error) {
        // If an error occurs, abort the transaction
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

/**
 * Get product inventory with batch details
 * @param {string} productId - The ID of the product
 */
exports.getProductInventory = async (productId) => {
    const product = await Product.findById(productId);
    
    if (!product) {
        throw new Error('Product not found');
    }
    
    // Get batches sorted by expiry date (FEFO)
    const sortedBatches = product.getBatchesByFefo();
    
    return {
        product: {
            _id: product._id,
            productName: product.productName,
            totalInStock: product.inStock,
            minStock: product.minStock,
            unit: product.unit,
            unitSize: product.unitSize,
            sellingPrice: product.sellingPrice
        },
        batches: sortedBatches
    };
};

/**
 * Reduce inventory when products are sold (using FEFO)
 * @param {string} productId - The ID of the product
 * @param {number} quantity - The quantity sold
 */
exports.reduceInventory = async (productId, quantity) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const product = await Product.findById(productId).session(session);
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        if (product.inStock < quantity) {
            throw new Error('Not enough inventory available');
        }
        
        // Get batches sorted by expiry date (FEFO)
        const sortedBatches = product.getBatchesByFefo();
        
        let remainingQuantity = quantity;
        const batchesUsed = [];
        
        // Reduce inventory from batches using FEFO
        for (const batch of sortedBatches) {
            if (remainingQuantity <= 0) break;
            
            if (batch.quantity > 0) {
                const quantityToDeduct = Math.min(batch.quantity, remainingQuantity);
                
                batch.quantity -= quantityToDeduct;
                remainingQuantity -= quantityToDeduct;
                
                batchesUsed.push({
                    batchNumber: batch.batchNumber,
                    quantityUsed: quantityToDeduct,
                    expiryDate: batch.expiryDate
                });
                
                // Remove batch if it's empty
                if (batch.quantity === 0) {
                    product.batches = product.batches.filter(b => 
                        b.batchNumber !== batch.batchNumber || 
                        !b.expiryDate.equals(batch.expiryDate)
                    );
                }
            }
        }
        
        await product.save({ session });
        
        // Commit the transaction
        await session.commitTransaction();
        session.endSession();
        
        return { 
            success: true, 
            message: 'Inventory updated successfully',
            batchesUsed: batchesUsed
        };
    } catch (error) {
        // If an error occurs, abort the transaction
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

/**
 * Get products that are below minimum stock level
 */
exports.getLowStockProducts = async () => {
    const products = await Product.find();
    
    const lowStockProducts = products.filter(product => 
        product.inStock < product.minStock
    );
    
    return lowStockProducts;
};

/**
 * Get products with batches nearing expiry
 * @param {number} daysThreshold - Number of days to consider as "nearing expiry"
 */
exports.getProductsNearingExpiry = async (daysThreshold = 30) => {
    const products = await Product.find();
    const currentDate = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(currentDate.getDate() + daysThreshold);
    
    const productsWithExpiringBatches = [];
    
    for (const product of products) {
        const expiringBatches = product.batches.filter(batch => 
            batch.expiryDate <= thresholdDate && 
            batch.expiryDate >= currentDate
        );
        
        if (expiringBatches.length > 0) {
            productsWithExpiringBatches.push({
                product: {
                    _id: product._id,
                    productName: product.productName
                },
                expiringBatches: expiringBatches
            });
        }
    }
    
    return productsWithExpiringBatches;
};