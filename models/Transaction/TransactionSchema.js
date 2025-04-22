const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true
    },

    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
    }],

    transactionType: {
        type: String,
        enum: ['sale', 'purchase', 'damage', 'return'],
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    notes: {
        type: String
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);