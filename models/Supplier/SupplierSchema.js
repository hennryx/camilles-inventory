const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true
    },
    contactPerson: {
        type: String,
    },
    email: {
        type: String
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String }
    },

    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        pricePerUnit: { type: Number },
        minimumOrderQuantity: { type: Number, default: 1 },
    }],

    paymentTerms: { type: String },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true
});

module.exports = mongoose.model('Suppliers', SupplierSchema);