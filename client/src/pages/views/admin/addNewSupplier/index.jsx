import React, { useEffect, useState } from 'react'
import Table from './table'
import useAuthStore from '../../../../services/stores/authStore';
import Swal from 'sweetalert2';
import useSuppliersStore from '../../../../services/stores/suppliers/suppliersStore';
import EmbededModal from './embededModal';

const info = {
    firstname: "",
    middlename: "",
    lastname: "",
    contactNumber: "",
    companyName: "",
    companyAddress: {
        region: "",
        province: "", 
        municipality: "",
        barangay: "",
        street: "",
        zipcode: ""
    },
    products: []
}

const AddNewSupplier = () => {
    const { token } = useAuthStore();
    const { getSuppliers, data, supplier, reset, message, isSuccess } = useSuppliersStore();
    const [toggleAdd, setToggleAdd] = useState(false);
    const [suppliersData, setSuppliersData] = useState([]);
    const [isUpdate, setIsUpdate] = useState(false);
    const [newSupplier, setNewSupplier] = useState(info);

    useEffect(() => {
        if (token) {
            getSuppliers(token);
        }
    }, [token]);

    useEffect(() => {
        if (data) {
            setSuppliersData(data)
        }
    }, [data]);

    const handleUpdate = (supplier) => {
        setToggleAdd(true);
        setNewSupplier(supplier);
        setIsUpdate(true);
    }

    useEffect(() => {
        if (isSuccess && message) {
            setToggleAdd(false);

            setNewSupplier(info);

            if (supplier && isUpdate) {
                const updatedSupplier = suppliersData.map(u =>
                    u._id === supplier._id ? supplier : u
                );
                setSuppliersData(updatedSupplier);
                setIsUpdate(false);

            } else if (supplier) {
                setSuppliersData((prev) => {
                    const exists = prev.some(u => u._id === supplier._id);

                    if (exists) {
                        return prev.filter(u => u._id !== supplier._id);
                    } else {
                        return [...prev, supplier];
                    }
                })
            }

            reset()
            Swal.fire({
                title: "Saved!",
                text: message,
                icon: "success"
            });


        } else if (message) {
            reset()
            Swal.fire({
                title: "Error!",
                text: message,
                icon: "error"
            });
        }
    }, [isSuccess, message, supplier])

    return (
        <>
            <div className='container'>
                <div className="flex flex-col gap-5 pt-4">
                    <div className=''>
                        <h2 className='text-xl text-[#4154F1]'>Add new Supplier</h2>
                        <p className='text-sm'><span className={`${toggleAdd ? "text-[#989797]":"text-gray-600"}`}>Suppliers</span> / {toggleAdd && (<span className="text-gray-600">Add new user</span>)}</p>
                    </div>
                    <div>
                        {toggleAdd ? (
                            <EmbededModal
                                setIsOpen={setToggleAdd}
                                setNewSupplier={setNewSupplier}
                                newSupplier={newSupplier}
                                isUpdate={isUpdate}
                                setIsUpdate={setIsUpdate}
                                temp={info}
                            />
                        ) : (
                            <Table
                                data={suppliersData}
                                toggleAdd={setToggleAdd}
                                handleUpdate={handleUpdate}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddNewSupplier