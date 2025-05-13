import React, { useEffect, useState, useRef } from 'react'
import useAuthStore from '../../../../services/stores/authStore';
import useProductsStore from '../../../../services/stores/products/productsStore';
import Swal from 'sweetalert2';
import NoImage from "../../../../assets/No-Image.png"
import { ENDPOINT } from '../../../../services/utilities';

const EmbededModal = ({ setIsOpen, setNewProduct, newProduct, isUpdate, setIsUpdate }) => {
    const [imagePreview, setImagePreview] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const fileInputRef = useRef(null);

    const { addProduct, updateProduct } = useProductsStore();
    const { token, auth } = useAuthStore();

    const categories = ["Energy Drink", "Soda", "Beer", "Probiotics", "Fruit juice", "Water"]

    const handleProductData = (key, value) => {
        setNewProduct((prev) => ({
            ...prev,
            [key]: value
        }));
    }

    const triggerFileInput = () => {
        fileInputRef.current.click();
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file type
            if (!file.type.match('image.*')) {
                setErrorMsg("Please select an image file");
                return;
            }

            // Check file size (limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrorMsg("Image size should be less than 5MB");
                return;
            }

            // Set file for upload
            handleProductData('image', file);

            // Create preview
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { productName, image, unit, unitSize, sellingPrice, category } = newProduct;

        console.log(typeof sellingPrice);

        // Validation
        if (
            productName.trim() === "" ||
            !image ||
            String(unit).trim() === "" ||
            String(unitSize).trim() === "" ||
            String(sellingPrice).trim() === "" ||
            String(category).trim() === ""
        ) {
            setErrorMsg("Please fill all the required fields!");
            return;
        }

        if (
            Number(sellingPrice) < 0
        ) {
            setErrorMsg(`Invalid price, cannot be lower than 0`);
            return;
        }

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('productName', productName);
        formData.append('image', image);
        formData.append('unit', unit);
        formData.append('unitSize', unitSize);
        formData.append('sellingPrice', sellingPrice);
        formData.append('createdBy', auth?._id);
        formData.append('category', category);

        if (isUpdate) {
            Swal.fire({
                title: "Are you sure?",
                text: "You want to update this product!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, Update it!"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    // Add product ID for update
                    formData.append('_id', newProduct._id);
                    await updateProduct(formData, token);
                    resetForm();
                }
            });
            return;
        }

        Swal.fire({
            title: "Are you sure?",
            text: "You want to add this product!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Add it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                await addProduct(formData, token);
                resetForm();
            }
        });
    }

    const resetForm = () => {
        setIsOpen(false);
        setIsUpdate(false);
        setNewProduct({
            productName: "",
            image: null,
            unit: "",
            unitSize: "",
            sellingPrice: "",
            category: ""
        });
        setImagePreview(null);
    }

    useEffect(() => {
        if (errorMsg) {
            setTimeout(() => {
                setErrorMsg("");
            }, 3000);
        }
    }, [errorMsg]);

    return (
        <div className='bg-white p-4 rounded-md flex flex-col gap-5'>
            <h3 className="text-2xl font-semibold text-[#4154F1]">
                {isUpdate ? "Update Product" : "Add New Product"}
            </h3>

            <div className="mt-2 flex flex-col gap-y-4">
                <h2 className="text-base/7 font-semibold text-gray-900">Product Information</h2>

                <div className="mt-8 grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-4">
                    <div className='sm:col-span-1'>
                        <div className="sm:col-span-6">
                            <label htmlFor="product-image" className="block text-sm/6 font-medium text-gray-900">
                                <span className='required'></span>
                                Product Image
                            </label>
                            <div className="mt-2 flex flex-col items-center gap-4">
                                <div className="h-40 w-40 overflow-hidden rounded border border-gray-300 bg-gray-100 flex items-center justify-center">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Product preview"
                                            className="h-full w-full object-cover object-center"
                                        />
                                    ) : (
                                        <img
                                            src={isUpdate ? `${ENDPOINT}/assets/products/${newProduct.image}` : NoImage}
                                            alt="Product placeholder"
                                            className="h-40 w-40 text-gray-400"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='9' cy='9' r='2'%3E%3C/circle%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'%3E%3C/path%3E%3C/svg%3E";
                                            }}
                                        />
                                    )}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    required
                                    id="product-image"
                                    name="image"
                                    type="file"
                                    accept="image/jpeg, image/png, image/jpg"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />

                                <button
                                    type="button"
                                    onClick={triggerFileInput}
                                    className="inline-flex items-center px-4 py-2 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Upload Image
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='sm:col-span-3'>
                        <div className='grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-4'>
                            <div className="sm:col-span-4">
                                <label htmlFor="product-name" className="block text-sm/6 font-medium text-gray-900">
                                    <span className='required'></span>
                                    Product Name
                                </label>
                                <div className="mt-2">
                                    <input
                                        required
                                        id="product-name"
                                        name="productName"
                                        type="text"
                                        autoComplete="off"
                                        value={newProduct.productName}
                                        onChange={(e) => handleProductData(e.target.name, e.target.value)}
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="unit" className="block text-sm/6 font-medium text-gray-900">
                                    <span className='required'></span>
                                    Unit
                                </label>
                                <div className="mt-2">
                                    <select
                                        required
                                        id="unit"
                                        name="unit"
                                        value={newProduct.unit}
                                        onChange={(e) => handleProductData(e.target.name, e.target.value)}
                                        className="block select w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    >
                                        <option value="">Select Unit</option>
                                        <option value="l">Liter (l)</option>
                                        <option value="ml">Milliliter (ml)</option>
                                        <option value="bottle">Bottle</option>
                                    </select>
                                </div>
                            </div>

                            {/* Unit Size */}
                            <div className="sm:col-span-2">
                                <label htmlFor="unit-size" className="block text-sm/6 font-medium text-gray-900">
                                    <span className='required'></span>
                                    Unit Size
                                </label>
                                <div className="mt-2">
                                    <input
                                        required
                                        id="unit-size"
                                        name="unitSize"
                                        type="text"
                                        value={newProduct.unitSize}
                                        onChange={(e) => handleProductData(e.target.name, e.target.value)}
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                        placeholder="e.g. 250, 500, 1"
                                    />
                                </div>
                            </div>

                            {/* Selling Price */}
                            <div className="sm:col-span-2">
                                <label htmlFor="selling-price" className="block text-sm/6 font-medium text-gray-900">
                                    <span className='required'></span>
                                    Selling Price
                                </label>
                                <div className="mt-2 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">₱</span>
                                    </div>
                                    <input
                                        required
                                        id="selling-price"
                                        name="sellingPrice"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={newProduct.sellingPrice}
                                        onChange={(e) => handleProductData(e.target.name, e.target.value)}
                                        className="block w-full pl-7 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div className="sm:col-span-2">
                                <label htmlFor="category" className="block text-sm/6 font-medium text-gray-900">
                                    <span className='required'></span>
                                    Category
                                </label>
                                <div className="mt-2">
                                    <select
                                        required
                                        id="category"
                                        name="category"
                                        value={newProduct.category}
                                        onChange={(e) => handleProductData(e.target.name, e.target.value)}
                                        className="block select w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((item, i)=> (
                                            <option key={i} value={item}>{item}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {errorMsg && (
                    <div className='mt-4 text-red-800 bg-red-200 p-2 flex justify-center rounded-md'>{errorMsg}</div>
                )}
            </div>

            <div className="mt-4">
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-5">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold ${isUpdate ? "bg-blue-200 text-blue-800 hover:bg-blue-300" : "bg-green-200 text-green-800 hover:bg-green-300"} sm:ml-3 sm:w-auto shadow-xs`}
                    >
                        {isUpdate ? "Update" : "Save"}
                    </button>

                    <button
                        type="button"
                        onClick={resetForm}
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-red-300 hover:text-red-800 sm:mt-0 sm:w-auto"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EmbededModal