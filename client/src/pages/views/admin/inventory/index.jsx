import React, { useEffect, useState } from 'react'
import Table from './table'
import { BsBoxSeam } from "react-icons/bs";
import { FaBoxOpen } from "react-icons/fa6";
import { BsBoxSeamFill } from "react-icons/bs";
import Card from './card';
import useAuthStore from '../../../../services/stores/authStore';
import useProductsStore from '../../../../services/stores/products/productsStore';
import EmbededModal from './embededModal';

const info = {
    productName: "",
    unit: "",
    unitSize: "",
    sellingPrice: "",
    inStock: 0,
    createdby: ""
}
const Inventory = () => {
    const { token } = useAuthStore();
    const { getProducts, data, product, reset, message, isSuccess } = useProductsStore();
    const [toggleAdd, setToggleAdd] = useState(false);
    const [productsData, setProductsdata] = useState([]);
    const [newProduct, setNewProduct] = useState(info)
    const [isUpdate, setIsUpdate] = useState(false)

    const handleUpdate = (supplier) => {
        setToggleAdd(true);
        setNewProduct(supplier);
        setIsUpdate(true);
    }

    const handleFetch = async (params) => {
        await getProducts(token, params)
    }
    useEffect(() => {
        if (token) {
            handleFetch({
                page: 1,
                limit: 5,
            })
        }
    }, [token]);

    useEffect(() => {
        if (data) {
            setProductsdata(data);
        }
    }, [data])

    return (
        <div className='container'>
            <div className="flex flex-col gap-5 pt-4">
                <div className=''>
                    <h2 className='text-xl text-[#4154F1]'>Inventory</h2>
                    <p className='text-sm'><span className={`${toggleAdd ? "text-[#989797]":"text-gray-600"}`}>Inventory</span> / {toggleAdd && (<span className="text-gray-600">Add new product</span>)}</p>
                </div>
                {!toggleAdd && (
                    <div>
                        <div className="bg-white p-2 shadow-md rounded-md">
                            <div className="flex flex-row gap-4 justify-start items-center px-2">
                                <Card title={"Total products"} textClr={'text-[#525B5F]'} boxClr={'bg-gray-400'} logo={BsBoxSeam} count={48} />
                                <div className='border-2 border-blue-200 h-10'></div>
                                <Card title={"Stock out:"} textClr={'text-red-800'} boxClr={'bg-red-200'} logo={FaBoxOpen} count={25} />
                                <div className='border-2 border-blue-200 h-10'></div>
                                <Card title={"Stock low:"} textClr={'text-yellow-800'} boxClr={'bg-yellow-200'} logo={BsBoxSeamFill} count={22} />
                            </div>
                        </div>
                    </div>
                )}
                <div>
                    {toggleAdd ? (
                        <EmbededModal
                            setIsOpen={setToggleAdd}
                            setNewSupplier={setNewProduct}
                            newSupplier={newProduct}
                            isUpdate={isUpdate}
                            setIsUpdate={setIsUpdate}   
                        />
                    ) : (
                        <Table data={productsData} totalItems={data.length} toggleAdd={setToggleAdd} handleUpdate={handleUpdate} handleFetch={handleFetch} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default Inventory