const mongoose = require('mongoose');

const ProductsSchema = new mongoose.Schema({
	productName: {
		type: String,
		required: [true, 'Please add a product name'],
		trim: true
	},

	unit: {
		type: String,
		required: true
	},

	unitSize: {
		type: String
	},

	sellingPrice: {
		type: Number
	},

	batches: [{
		batchNumber: {
			type: String,
			required: true
		},

		quantity: {
			type: Number,
			required: true,
			default: 0
		},

		expiryDate: {
			type: Date,
			required: true
		},

		purchaseDate: {
			type: Date,
			required: true
		},

		pricePerUnit: {
			type: Number,
			required: true
		},
		// Reference to the purchase this batch came from
		purchaseId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Purchase'
		}
	}],

	image: {
		type: String
	},

	minStock: {
		type: Number,
		default: 10
	},
	
	createdBy: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true
	}
}, {
	timestamps: true,
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

// Virtual for total stock (calculated from all batches)
ProductsSchema.virtual('inStock').get(function() {
	return this.batches.reduce((total, batch) => total + batch.quantity, 0);
});

// Method to get batches ordered by expiry date (for FEFO)
ProductsSchema.methods.getBatchesByFefo = function() {
	return this.batches.sort((a, b) => a.expiryDate - b.expiryDate);
};

module.exports = mongoose.model('Product', ProductsSchema);