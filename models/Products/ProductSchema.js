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

	image: {
		type: String
	},
	
	createdBy: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true
	},

	category: {
		type: String,
	},
	
	status: {
		type: String,
		enum: ['active', 'inactive'],
		default: 'active'
	}
}, {
	timestamps: true
});

module.exports = mongoose.model('Product', ProductsSchema);