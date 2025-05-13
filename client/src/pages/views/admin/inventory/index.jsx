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
import Swal from 'sweetalert2';

const info = {
    productName: "",
    unit: "",
    unitSize: "",
    sellingPrice: "",
    createdby: "",
    category: ""
}
const Inventory = () => {
    const { token } = useAuthStore();
    const { getProducts, data, productInfo, product, reset, message, isSuccess, isLoading } = useProductsStore();
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
            setStocksInfo(productInfo);
            console.log(productInfo);
            
        }
    }, [data])

    useEffect(() => {
        if (isSuccess && message) {
            console.log("--3", data);

            setToggleAdd(false)
            setToggleReduce(false)

            setNewProduct(info)

            if(data) {
                setProductsdata(data);
                setStocksInfo(productInfo);
            }else if (product && isUpdate) {
                const updatedProduct = productsData.map(u =>
                    u._id === product._id ? product : u
                );
                setProductsdata(updatedProduct);
                setIsUpdate(false);

            } else if (product) {
                setProductsdata((prev) => {
                    const exists = prev.some(u => u._id === product._id);

                    if (exists) {
                        return prev.filter(u => u._id !== product._id);
                    } else {
                        return [...prev, product];
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

    }, [message, isSuccess, product, data])

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
                                <Card title={"Total products"} textClr={'text-[#525B5F]'} boxClr={'bg-gray-400'} logo={BsBoxSeam} count={stocksInfo.totalItems || 0} />
                                <div className='border-2 border-blue-200 h-10'></div>
                                <Card title={"Stock out:"} textClr={'text-red-800'} boxClr={'bg-red-200'} logo={FaBoxOpen} count={stocksInfo.outStock || 0} />
                                <div className='border-2 border-blue-200 h-10'></div>
                                <Card title={"Stock low:"} textClr={'text-yellow-800'} boxClr={'bg-yellow-200'} logo={BsBoxSeamFill} count={stocksInfo.minimumStock || 0} />
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
                        <div className={`transition-all duration-300 ease-in ${toggleReduce ? 'w-2/3' : 'w-full'}`}>
                            <Table
                                data={productsData}
                                totalItems={data.length}
                                toggleAdd={setToggleAdd}
                                handleUpdate={handleUpdate}
                                setToggleReduce={setToggleReduce}
                                setReduceProduct={setReduceProduct}
                                isLoading={isLoading}
                                loadData={handleFetch}
                            />
                        </div>
                    )}

                    {!toggleAdd && toggleReduce && (
                        <div className="w-1/3 bg-white rounded-lg shadow-md transition-all duration-300 ease-in-out">
                            <ReduceDrawer
                                reduceProduct={reduceProduct}
                                onClose={setToggleReduce}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Inventory