const mongoose = require('mongoose');

const SalesSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true
    },
    saleDate: {
        type: Date,
        default: Date.now
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        pricePerUnit: {
            type: Number,
            required: true
        },
        batchesUsed: [{
            batch: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'InventoryBatch'
            },
            quantityUsed: {
                type: Number
            }
        }],
        totalPrice: {
            type: Number
        }
    }],
    totalAmount: {
        type: Number, required: true
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Sales', SalesSchema);