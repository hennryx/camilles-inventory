import React, { useEffect, useState } from 'react'
import useAuthStore from '../../../../services/stores/authStore';
import Swal from 'sweetalert2';
import usePurchaseStore from '../../../../services/stores/purchase/purchaseStore';
import useSuppliersStore from '../../../../services/stores/suppliers/suppliersStore';
import { Checkbox } from '@headlessui/react';
import { ENDPOINT } from '../../../../services/utilities';

const EmbededModal = ({ setIsOpen, setNewPurchase, newPurchase, isUpdate, setIsUpdate, temp }) => {
    const { addPurchase, updatePurchase } = usePurchaseStore();
    const { data: SuppliersData, getSuppliers } = useSuppliersStore()
    const { token, auth } = useAuthStore();
    const [errorMsg, setErrorMsg] = useState("");
    const [suppliers, setSuppliers] = useState([]);
    const [supBasicInfo, setSupBasicInfo] = useState({})

    useEffect(() => {
        if (token) {
            getSuppliers(token)
        }
    }, [token]);

    useEffect(() => {
        if (SuppliersData) {
            setSuppliers(SuppliersData)
        }
    }, [SuppliersData])

    const handleSupplierData = (key, value) => {
        setNewPurchase((prev) => ({
            ...prev,
            [key]: value
        }));
    }

    useEffect(() => {
        if (Object.keys(newPurchase).length > 0) {
            const selectedSupplier = suppliers.find(sup => sup._id === newPurchase.supplier);
            if (selectedSupplier) {
                const { firstname, middlename, lastname, companyAddress, ...res } = selectedSupplier;

                const { street, barangay, municipality, province } = companyAddress;
                const address = `Street ${street}, Brgy. ${barangay}, ${municipality}, ${province}`;

                const name = firstname + " " + middlename + " " + lastname;

                console.log(res);

                setSupBasicInfo({ ...res, name, address })
            }
        }
    }, [newPurchase])

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(newPurchase)

        let { supplier, purchaseDate, paymentDetails, items, createdBy } = newPurchase;

        if (
            supplier.trim() === "" ||
            paymentDetails.trim() === "" ||
            items.trim() === ""
        ) {
            setErrorMsg("Please fill all the required fields!");
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
                    purchaseDate = new Date();
                    createdBy = auth._id
                    await updatePurchase(newPurchase, token)
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
                await addPurchase(newPurchase, token);
            }
        });
    }

    const handleCancel = () => {
        setIsOpen(false);
        setIsUpdate(false);
        setNewPurchase(temp);
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
                {isUpdate ? "Update purchase" : "Add new purchase"}
            </h3>

            <div className="mt-2">
                <h2 className="text-base/7 font-semibold text-gray-900">Purchase Information</h2>
                <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm/6 font-medium text-gray-900">
                            <span className='required'></span>
                            Supplier
                        </label>
                        <select
                            name="supplier"
                            value={newPurchase.supplier}
                            onChange={(e) => handleSupplierData(e.target.name, e.target.value)}
                            className="mt-1 block w-full select px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">--Select Supplier--</option>
                            {suppliers.map((sup, i) => (
                                <option key={i} value={sup._id}>{sup.companyName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="middle-name" className="block text-sm/6 font-medium text-gray-900">
                            Supplier name
                        </label>
                        <div className="mt-2">
                            <input
                                value={supBasicInfo.name || ""}
                                disabled={true}
                                type="text"
                                autoComplete="off"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="middle-name" className="block text-sm/6 font-medium text-gray-900">
                            Supplier Contact
                        </label>
                        <div className="mt-2">
                            <input
                                value={supBasicInfo?.contactNumber || ""}
                                disabled={true}
                                type="text"
                                autoComplete="off"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="middle-name" className="block text-sm/6 font-medium text-gray-900">
                            Company address
                        </label>
                        <div className="mt-2">
                            <input
                                value={supBasicInfo.address || ""}
                                disabled={true}
                                type="text"
                                autoComplete="off"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <div className="border-b border-gray-900/10 pb-2">
                    <h2 className="text-base/7 font-semibold text-gray-900">Company Products</h2>
                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                        {supBasicInfo?.products?.length > 0 && supBasicInfo.products.map((item, i) => (

                            <div className='bg-gray-100 rounded-md flex justify-start items-start p-2 gap-2' key={i}>
                                <Checkbox
                                    className="group block size-4 rounded-full bg-white border border-gray-400 data-[checked]:bg-blue-200"
                                    checked={true}
                                >
                                    <svg className="stroke-blue-800 opacity-0 group-data-[checked]:opacity-100" viewBox="0 0 14 14" fill="none">
                                        <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Checkbox>

                                <div className="flex flex-col gap-1">
                                    <img src={`${ENDPOINT}/assets/products/${item.image}`} alt="product" className='h-15'/>
                                    <div>
                                        <p className='text-sm text-gray-500'>Name: <span className='text-gray-800'>{item.productName}</span></p>
                                        <p className='text-sm text-gray-500'>Size: <span className='text-gray-800'>{item.unitSize} {item.unit}</span></p>
                                    </div>
                                </div>
                            </div>

                        ))}

                    </div>
                </div>

                {errorMsg && (
                    <div className='text-red-800 bg-red-200 p-2 flex justify-center rounded-md'>{errorMsg}</div>
                )}
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