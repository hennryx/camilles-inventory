const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    purchaseItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase.items' }, // Reference to the purchase
    quantity: { type: Number, required: true },
    remainingQuantity: { type: Number, required: true }, // Track what's left of this batch
    manufacturingDate: { type: Date },
    expiryDate: { type: Date, required: true },
    batchNumber: { type: String },
    location: { type: String }, // Storage location
    isConsumed: { type: Boolean, default: false }, // Whether the batch is fully used
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }

}, {
    timestamps: true
});

module.exports = mongoose.model('Purchase', PurchaseSchema);