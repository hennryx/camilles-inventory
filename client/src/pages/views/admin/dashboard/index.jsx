import React, { useEffect, useState } from 'react';
import Card from './card';
import { BsBoxes } from "react-icons/bs";
import { FaArrowUp, FaCheckDouble, FaFire } from "react-icons/fa6";
import { FaBoxOpen } from "react-icons/fa";
import Table from './table';
import SalesChart from './salesChart';
import useProductsStore from '../../../../services/stores/products/productsStore';
import useTransactionsStore from '../../../../services/stores/transactions/transactionStore';
import useAuthStore from '../../../../services/stores/authStore';
import { ENDPOINT } from '../../../../services/utilities';

const Dashboard = () => {
    const { token } = useAuthStore();
    const { getProducts, topProducts, data, productInfo } = useProductsStore();
    const { getTransactions, data: transactionData } = useTransactionsStore();
    const [productState, setProductState] = useState({});
    const [topSelling, setTopSelling] = useState([])
    const [recentlyAddedProducts, setRecentlyAddedProducts] = useState(0);
    const [timeFilter, setTimeFilter] = useState('day');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [useDateRange, setUseDateRange] = useState(false);

    useEffect(() => {
        if (token) {
            getProducts(token);
            getTransactions(token);
        }
    }, [token]);

    useEffect(() => {
        if (topProducts) {
            console.log(topProducts);
            setTopSelling(topProducts)
        }
    }, [topProducts]);

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

    // Handle date range input changes
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
        setUseDateRange(true);
    };

    // Reset to predefined time filters
    const handleTimeFilterClick = (filter) => {
        setTimeFilter(filter);
        setUseDateRange(false);
    };

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

                <div className="bg-white shadow-lg rounded-xl p-6 mb-6 flex flex-col w-full">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Sales Overview</h2>

                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="lg:flex-1 lg:w-3/4">
                            <div className="flex flex-col sm:flex-row justify-start items-center mb-6 gap-4">
                                <div className="flex flex-col flex-wrap gap-3 justify-start items-start">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={dateRange.startDate}
                                            onChange={handleDateChange}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                        <span className="text-gray-600">to</span>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={dateRange.endDate}
                                            onChange={handleDateChange}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                    </div>
                                    <div className="flex space-x-2">
                                        {['day', 'month', 'year'].map((filter) => (
                                            <button
                                                key={filter}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!useDateRange && timeFilter === filter
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                onClick={() => handleTimeFilterClick(filter)}
                                            >
                                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <SalesChart
                                timeFilter={timeFilter}
                                transactionData={transactionData}
                                dateRange={useDateRange ? dateRange : null}
                            />
                        </div>

                        {/* Fast Moving Products Section (1/4 width) */}
                        <div className="lg:w-1/4 bg-gray-50 rounded-lg p-5 shadow-inner">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-200 flex items-center gap-2">
                                <FaFire className="text-red-500" /> Fast Moving Products
                            </h2>
                            <div className="flex flex-col gap-4 overflow-auto">
                                {topSelling.map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition"
                                    >
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={`${ENDPOINT}/assets/products/${item.image}`}
                                                alt={item.name}
                                                className="h-16 w-16 object-cover rounded-md"
                                                onError={(e) => (e.target.src = 'https://via.placeholder.com/64')}
                                            />
                                            <div className="flex flex-col">
                                                <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                                                <p className="text-sm text-gray-500">${parseFloat(item.price).toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-semibold text-green-600">{item.totalSold}</span>
                                            <FaArrowUp className="text-green-500" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
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