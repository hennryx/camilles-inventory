import React, { useEffect, useState } from 'react'
import Card from './card'
import { BsBoxes } from "react-icons/bs";
import { FaCheckDouble } from "react-icons/fa6";
import { FaBoxOpen } from "react-icons/fa";
import Table from './table';
import useProductsStore from '../../../../services/stores/products/productsStore';
import useAuthStore from '../../../../services/stores/authStore';

const Dashboard = () => {
    const { token } = useAuthStore()
    const { getProducts, data, productInfo } = useProductsStore();
    const [ productState, setProductState ] = useState({})

    useEffect(() => {
        if(token) {
            getProducts(token)
        }
    }, [token])

    useEffect(() => {
        if(productInfo) {
            console.log(productInfo);
            setProductState(productInfo)
        }
    }, [productInfo])
    return (
        <div className='container'>
            <div className="flex flex-col gap-5 pt-4">
                <div>
                    <h2 className='text-2xl'>Hi, here's what's happening in your store</h2>
                </div>

                <div className='flex gap-5'>
                    <Card title={"Total products"} count={productInfo.totalItems} logo={BsBoxes}/>
                    <Card title={"Recently added products"} count={0} logo={FaCheckDouble} logoColor='text-green-400' />
                    <Card title={"Out of stock products"} count={productInfo.outStock} logo={FaBoxOpen} logoColor='text-yellow-400' />
                </div>
                
                <div>
                    <Table />
                </div>
            </div>
        </div>
    )
}

export default Dashboard