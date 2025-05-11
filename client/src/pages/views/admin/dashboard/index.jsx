import React, { useEffect, useState } from 'react';
import Card from './card';
import { BsBoxes } from "react-icons/bs";
import { FaCheckDouble } from "react-icons/fa6";
import { FaBoxOpen } from "react-icons/fa";
import Table from './table';
import SalesChart from './salesChart';
import useProductsStore from '../../../../services/stores/products/productsStore';
import useTransactionsStore from '../../../../services/stores/transactions/transactionStore';
import useAuthStore from '../../../../services/stores/authStore';

const Dashboard = () => {
    const { token } = useAuthStore();
    const { getProducts, data, productInfo } = useProductsStore();
    const { getTransactions, data: transactionData } = useTransactionsStore();
    const [productState, setProductState] = useState({});
    const [recentlyAddedProducts, setRecentlyAddedProducts] = useState(0);
    const [timeFilter, setTimeFilter] = useState('day');

    useEffect(() => {
        if (token) {
            getProducts(token);
            getTransactions(token);
        }
    }, [token]);

    useEffect(() => {
        if (productInfo) {
            setProductState(productInfo);
        }
    }, [productInfo]);

    useEffect(() => {
        if (data && data.length > 0) {
            const now = new Date();
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);

            const recentProducts = data.filter(product => {
                const createdAt = new Date(product.createdAt);
                return createdAt >= yesterday;
            });

            setRecentlyAddedProducts(recentProducts.length);
        }
    }, [data]);

    return (
        <div className='container'>
            <div className="flex flex-col gap-5 pt-4">
                <div>
                    <h2 className='text-2xl'>Hi, here's what's happening in your store</h2>
                </div>

                <div className='flex gap-5'>
                    <Card title={"Total products"} count={productInfo.totalItems} logo={BsBoxes} />
                    <Card title={"Recently added products"} count={recentlyAddedProducts} logo={FaCheckDouble} logoColor='text-green-400' />
                    <Card title={"Out of stock products"} count={productInfo.outStock} logo={FaBoxOpen} logoColor='text-yellow-400' />
                </div>

                <div className="bg-white shadow-md rounded-lg p-4 mb-5">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Sales Overview</h2>
                        <div className="flex space-x-2">
                            <button 
                                className={`px-3 py-1 rounded-md ${timeFilter === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                                onClick={() => setTimeFilter('day')}
                            >
                                Day
                            </button>
                            <button 
                                className={`px-3 py-1 rounded-md ${timeFilter === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                                onClick={() => setTimeFilter('month')}
                            >
                                Month
                            </button>
                            <button 
                                className={`px-3 py-1 rounded-md ${timeFilter === 'year' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                                onClick={() => setTimeFilter('year')}
                            >
                                Year
                            </button>
                        </div>
                    </div>
                    <SalesChart timeFilter={timeFilter} transactionData={transactionData} />
                </div>

                <div>
                    <h2 className="text-lg font-semibold mb-4">Today's Transactions</h2>
                    <Table filter="today" />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;