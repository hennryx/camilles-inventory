import React, { useEffect, useState } from 'react'
import useAuthStore from '../../../../services/stores/authStore';
import useSuppliersStore from '../../../../services/stores/suppliers/suppliersStore';
import AddressSelector from '../../../../components/address';
import Swal from 'sweetalert2';
import useProductsStore from '../../../../services/stores/products/productsStore';
import { Checkbox } from '@headlessui/react';
import { ENDPOINT } from '../../../../services/utilities';

const EmbededModal = ({ setIsOpen, setNewSupplier, newSupplier, isUpdate, setIsUpdate, temp }) => {
    const { data: productsData, getProducts } = useProductsStore();
    const { addSupplier, updateSupplier } = useSuppliersStore();

    const [errorMsg, setErrorMsg] = useState("");
    const { token } = useAuthStore();
    const [products, setProducts] = useState([])

    useEffect(() => {
        if (token) {
            getProducts(token)
        }
    }, [token])

    useEffect(() => {
        if (productsData) {
            setProducts(productsData)
        }
    }, [productsData])

    const handleSupplierData = (key, value) => {
        setNewSupplier((prev) => ({
            ...prev,
            [key]: value
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { firstname, lastname, contactNumber, companyAddress, companyName } = newSupplier;
        const { region, province, municipality, barangay, zipcode } = companyAddress;

        if (
            firstname.trim() === "" ||
            lastname.trim() === "" ||
            companyName.trim() === "" ||
            region.trim() === "" ||
            province.trim() === "" ||
            municipality.trim() === "" ||
            barangay.trim() === "" ||
            zipcode.trim() === ""
        ) {
            setErrorMsg("Please fill all the required fields!");
            return;
        }

        if (!/^\d{11}$/.test(contactNumber.trim())) {
            setErrorMsg("Contact number must be exactly 11 digits.");
            return;
        }


        if (isUpdate) {
            Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, Submit it!"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await updateSupplier(newSupplier, token)
                }
            });
            return;
        }

        Swal.fire({
            title: "Are you sure?",
            text: "You want to Add this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes"
        }).then(async (result) => {
            if (result.isConfirmed) {
                await addSupplier(newSupplier, token);
            }
        });
    }

    const handleCancel = () => {
        setIsOpen(false);
        setIsUpdate(false);
        setNewSupplier(temp);
    }

    useEffect(() => {
        if (errorMsg) {
            setTimeout(() => {
                setErrorMsg("");
            }, 3000);
        }
    }, [errorMsg])

    return (
        <div className='bg-white p-4 rounded-md flex flex-col gap-5'>
            <h3 className="text-2xl font-semibold text-[#4154F1]">
                {isUpdate ? "Update supplier" : "Add new supplier"}
            </h3>

            <div className="mt-2">
                <h2 className="text-base/7 font-semibold text-gray-900">Supplier Information</h2>
                <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">

                    <div className="sm:col-span-4">
                        <label htmlFor="first-name" className="block text-sm/6 font-medium text-gray-900">
                            <span className='required'></span>
                            First name
                        </label>
                        <div className="mt-2">
                            <input
                                required
                                id="first-name"
                                name="firstname"
                                type="text"
                                autoComplete="off"
                                value={newSupplier?.firstname || ""}
                                onChange={(e) => handleSupplierData(e.target.name, e.target.value)}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="middle-name" className="block text-sm/6 font-medium text-gray-900">
                            Middle name
                        </label>
                        <div className="mt-2">
                            <input
                                id="middle-name"
                                name="middlename"
                                value={newSupplier?.middlename}
                                onChange={(e) => handleSupplierData(e.target.name, e.target.value)}
                                type="text"
                                autoComplete="off"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="last-name" className="block text-sm/6 font-medium text-gray-900">
                            <span className='required'></span>
                            Last name
                        </label>
                        <div className="mt-1">
                            <input
                                required
                                id="last-name"
                                name="lastname"
                                value={newSupplier?.lastname}
                                onChange={(e) => handleSupplierData(e.target.name, e.target.value)}
                                type="text"
                                autoComplete="off"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="last-name" className="block text-sm/6 font-medium text-gray-900">
                            <span className='required'></span>
                            Contact number
                        </label>
                        <div className="mt-1">
                            <input
                                required
                                id="contact-number"
                                name="contactNumber"
                                value={newSupplier?.contactNumber}
                                onChange={(e) => {
                                    const input = e.target.value;

                                    if (/^\d{0,11}$/.test(input)) {
                                        handleSupplierData(e.target.name, input)
                                    }

                                }}
                                type="number"
                                maxLength={11}
                                autoComplete="off"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <div className="border-b border-gray-900/10 pb-2">
                    <h2 className="text-base/7 font-semibold text-gray-900">Company Details</h2>
                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">

                        <div className="sm:col-span-6">
                            <label htmlFor="first-name" className="block text-sm/6 font-medium text-gray-900">
                                <span className='required'></span>
                                Company name
                            </label>
                            <div className="mt-2">
                                <input
                                    required
                                    id="company-name"
                                    name="companyName"
                                    type="text"
                                    value={newSupplier?.companyName || ""}
                                    onChange={(e) => handleSupplierData(e.target.name, e.target.value)}
                                    autoComplete="given-name"
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="middle-name" className="block text-sm/6 font-medium text-gray-900">
                                <span className='required'></span>
                                Company address
                            </label>
                            <div className="mt-2">
                                <AddressSelector
                                    setAddress={(addr) =>
                                        setNewSupplier((prev) => ({
                                            ...prev,
                                            companyAddress: {
                                                ...prev.companyAddress,
                                                ...addr,
                                            },
                                        }))
                                    }
                                    address={newSupplier.companyAddress}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <h2 className="text-base/7 font-semibold text-gray-900">Company Products</h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {products.map((item, i) => (
                        <div
                            key={i}
                            className="flex gap-2 justify-start items-center bg-gray-50 p-2 rounded-md"
                        >
                            <Checkbox
                                checked={newSupplier.products?.some(prd => prd === item._id)}
                                onChange={(isChecked) => {
                                    if (isChecked) {
                                        setNewSupplier((prev) => ({
                                            ...prev,
                                            products: [...prev.products, item._id]
                                        }))
                                    } else {
                                        setNewSupplier(prev => ({
                                            ...prev,
                                            products: prev.products.filter(prd => prd !== item._id),
                                        }));
                                    }
                                }}
                                className="group block size-4 rounded-full bg-white border border-gray-400 data-[checked]:bg-blue-200"
                            >
                                <svg className="stroke-blue-800 opacity-0 group-data-[checked]:opacity-100" viewBox="0 0 14 14" fill="none">
                                    <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Checkbox>

                            <img
                                className='h-12 w-auto'
                                src={`${ENDPOINT}/assets/products/${item.image}`}
                                alt={item.productName}
                            />

                            <div className="flex flex-col text-sm/6 font-medium text-gray-900">
                                <h2>{item.productName}</h2>
                                <h2>{item.unitSize} {item.unit}</h2>
                            </div>
                        </div>
                    ))}

                    {errorMsg && (
                        <div className='text-red-800 bg-red-200 p-2 flex justify-center rounded-md'>{errorMsg}</div>
                    )}
                </div>
            </div>

            <div className="mt-4">
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-5">
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e)}
                        className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold ${isUpdate ? "bg-blue-200 text-blue-800 hover:bg-blue-300" : "bg-green-200 text-green-800 hover:bg-green-300"} sm:ml-3 sm:w-auto shadow-xs`}
                    >
                        {isUpdate ? "Update" : "Save"}
                    </button>

                    <button
                        type="button"
                        data-autofocus
                        onClick={() => handleCancel()}
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