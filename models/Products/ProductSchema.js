const mongoose = require('mongoose');

const ProductsSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please add a product name'],
		trim: true
	},
	description: {
		type: String,
	},
	category: {
		type: String
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
	inStock: {
		type: Number,
		default: 0
	},
	image: {
		type: String
	},
	createdBy: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true
	}
}, {
	timestamps: true
});

module.exports = mongoose.model('Product', ProductsSchema);