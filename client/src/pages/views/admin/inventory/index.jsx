import React, { useEffect, useState } from 'react'
import Table from './table'
import { BsBoxSeam } from "react-icons/bs";
import { FaBoxOpen } from "react-icons/fa6";
import { BsBoxSeamFill } from "react-icons/bs";
import Card from './card';
import useAuthStore from '../../../../services/stores/authStore';
import useProductsStore from '../../../../services/stores/products/productsStore';
import EmbededModal from './embededModal';
import ReduceDrawer from './reduceDrawer';

const info = {
    productName: "",
    unit: "",
    unitSize: "",
    sellingPrice: "",
    inStock: 0,
    createdby: "",
    minStock: 10,
}
const Inventory = () => {
    const { token } = useAuthStore();
    const { getProducts, data, productInfo, product, reset, message, isSuccess } = useProductsStore();
    const [toggleAdd, setToggleAdd] = useState(false);
    const [toggleReduce, setToggleReduce] = useState(false);
    const [productsData, setProductsdata] = useState([]);
    const [newProduct, setNewProduct] = useState(info)
    const [reduceProduct, setReduceProduct] = useState({})
    const [isUpdate, setIsUpdate] = useState(false)
    const [stocksInfo, setStocksInfo] = useState({})

    const handleUpdate = (_product) => {
        setToggleAdd(true);
        setNewProduct(_product);
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
            console.log(productInfo);

            setStocksInfo(productInfo);
        }
    }, [data])

    return (
        <div className='container'>
            <div className="flex flex-col gap-5 pt-4">
                <div className=''>
                    <h2 className='text-xl text-[#4154F1]'>Inventory</h2>
                    <p className='text-sm'><span className={`${toggleAdd ? "text-[#989797]" : "text-gray-600"}`}>Inventory</span> / {toggleAdd && (<span className="text-gray-600">Add new product</span>)}</p>
                </div>
                {!toggleAdd && (
                    <div>
                        <div className="bg-white p-2 shadow-md rounded-md">
                            <div className="flex flex-row gap-4 justify-start items-center px-2">
                                <Card title={"Total products"} textClr={'text-[#525B5F]'} boxClr={'bg-gray-400'} logo={BsBoxSeam} count={stocksInfo.totalItems} />
                                <div className='border-2 border-blue-200 h-10'></div>
                                <Card title={"Stock out:"} textClr={'text-red-800'} boxClr={'bg-red-200'} logo={FaBoxOpen} count={stocksInfo.outStock} />
                                <div className='border-2 border-blue-200 h-10'></div>
                                <Card title={"Stock low:"} textClr={'text-yellow-800'} boxClr={'bg-yellow-200'} logo={BsBoxSeamFill} count={stocksInfo.minStock} />
                            </div>
                        </div>
                    </div>
                )}

                {toggleAdd && (
                    <EmbededModal
                        setIsOpen={setToggleAdd}
                        setNewProduct={setNewProduct}
                        newProduct={newProduct}
                        isUpdate={isUpdate}
                        setIsUpdate={setIsUpdate}
                    />
                )}

                <div className="flex flex-row gap-4">
                    {!toggleAdd && (
                        <div className='flex-2 transition-all duration-300 ease-in'>
                            <Table
                                data={productsData}
                                totalItems={data.length}
                                toggleAdd={setToggleAdd}
                                handleUpdate={handleUpdate}
                                handleFetch={handleFetch}
                                setToggleReduce={setToggleReduce}
                                setReduceProduct={setReduceProduct}
                            />
                        </div>
                    )}

                    {!toggleAdd && toggleReduce && (
                        <div className='flex-1 bg-white rounded-md p-2 h-full transition-all duration-300 ease-in-out'>
                            <ReduceDrawer reduceProduct={reduceProduct} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Inventory