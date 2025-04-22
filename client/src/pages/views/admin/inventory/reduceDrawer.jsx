import React, { useState } from 'react'
import NoImage from "../../../../assets/No-Image.png"
import { ENDPOINT } from '../../../../services/utilities';
import useProductsStore from '../../../../services/stores/products/productsStore';
import useAuthStore from '../../../../services/stores/authStore';

const ReduceDrawer = ({ reduceProduct, onClose }) => {
    const { token, auth } = useAuthStore();
    const { addProduct } = useProductsStore();
    const { image, productName, sellingPrice, unit, unitSize, inStock, _id } = reduceProduct;

    const [formData, setFormData] = useState({
        quantity: 1,
        transactionType: 'SALE',
        notes: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.quantity || formData.quantity <= 0) {
            newErrors.quantity = 'Quantity must be greater than zero';
        }

        if (formData.quantity > inStock) {
            newErrors.quantity = 'Quantity cannot exceed available stock';
        }

        if (!formData.transactionType) {
            newErrors.transactionType = 'Please select a transaction type';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const transactionData = {
            product: _id,
            createdBy: auth._id,
            ...formData,
            quantity: parseInt(formData.quantity),
        };

        await addProduct(transactionData, token)
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center border-b border-gray-200 p-4 mb-4">
                <h2 className="text-xl font-bold">Reduce Stock</h2>
                <button
                    onClick={() => onClose(prev => !prev)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="flex flex-col items-center p-4 gap-4">
                <div className="h-32 w-32 overflow-hidden rounded border border-gray-300 bg-gray-100 flex items-center justify-center">
                    <img
                        className="h-32 w-32 object-cover rounded-md"
                        src={`${ENDPOINT}/assets/products/${image}`}
                        alt={productName}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = NoImage;
                        }}
                    />
                </div>
                <div className="border-y border-gray-100 w-full py-4">
                    <h3 className="text-lg font-semibold mb-2">Product Details</h3>

                    <div className="grid grid-cols-2 gap-2">
                        <p className="text-sm text-gray-500">Name:</p>
                        <p className="text-sm font-medium">{productName}</p>

                        <p className="text-sm text-gray-500">Price:</p>
                        <p className="text-sm font-medium">₱ {sellingPrice}</p>

                        <p className="text-sm text-gray-500">Size:</p>
                        <p className="text-sm font-medium">{unitSize} {unit}</p>

                        <p className="text-sm text-gray-500">Available Stock:</p>
                        <p className="text-sm font-medium">{inStock}  {inStock > 1 ? "bottles" : "bottle"}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Transaction Type
                        </label>
                        <select
                            name="transactionType"
                            value={formData.transactionType}
                            onChange={handleChange}
                            className="mt-1 block w-full select px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="SALE">Sale</option>
                            <option value="DAMAGE">Damage/Loss</option>
                        </select>
                        {errors.transactionType && (
                            <p className="mt-1 text-sm text-red-600">{errors.transactionType}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Quantity to Reduce
                        </label>
                        <div className="mt-1 rounded-md shadow-sm">
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                min="1"
                                max={inStock}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                        </div>
                        {errors.quantity && (
                            <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Notes (Optional)
                        </label>
                        <textarea
                            name="notes"
                            rows="3"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Additional information..."
                            className="mt-1 p-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            /* type="submit" */
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Record Transaction
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ReduceDrawer