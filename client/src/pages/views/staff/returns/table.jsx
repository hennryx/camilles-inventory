// client/src/pages/views/admin/returns/table.jsx
import React, { useState, useEffect } from 'react';
import { IoIosAdd } from "react-icons/io";
import Swal from 'sweetalert2';
import useAuthStore from '../../../../services/stores/authStore';
import useReturnsStore from '../../../../services/stores/returns/returnsStore';
import toDate from '../../../../services/utilities/convertDate';

const Table = ({ data, toggleAdd, handleUpdate, isLoading }) => {
    const { deleteReturn } = useReturnsStore();
    const { token } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    useEffect(() => {
        if (data) {
            if (searchTerm) {
                const filtered = data.filter(item => 
                    item.products.some(p => 
                        p.product?.productName?.toLowerCase().includes(searchTerm.toLowerCase())
                    ) ||
                    item.notes?.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setFilteredData(filtered);
            } else {
                setFilteredData(data);
            }
        }
    }, [data, searchTerm]);

    const handleDelete = (e, returnData) => {
        e.preventDefault();

        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteReturn(returnData, token);
            }
        });
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const renderPagination = () => {
        return (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                    <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                            <span className="font-medium">
                                {indexOfLastItem > filteredData.length ? filteredData.length : indexOfLastItem}
                            </span>{" "}
                            of <span className="font-medium">{filteredData.length}</span> results
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="rounded border-gray-300 text-sm"
                        >
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                        </select>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                            >
                                <span className="sr-only">Previous</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.06.02z" clipRule="evenodd" />
                                </svg>
                            </button>
                            {pageNumbers.map((number) => (
                                <button
                                    key={number}
                                    onClick={() => handlePageChange(number)}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === number
                                        ? 'bg-blue-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                                        }`}
                                >
                                    {number}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                            >
                                <span className="sr-only">Next</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="overflow-x-auto bg-white shadow-md rounded-2xl">
            <table className="table">
                <caption>
                    <div className='flex justify-between p-4'>
                        <h3 className='text-xl'>Returns</h3>
                        <div className='flex flex-row gap-4 justify-center items-center'>
                            <label className="input bg-transparent border-2 border-gray-500 rounded-md">
                                <svg className="h-4 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></g></svg>
                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search"
                                />
                            </label>
                            <div>
                                <select
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    onChange={(e) => {
                                        if (e.target.value === 'all') {
                                            setFilteredData(data);
                                        } else {
                                            const filtered = data.filter(item => {
                                                const returnDate = new Date(item.createdAt);
                                                const today = new Date();
                                                const yesterday = new Date(today);
                                                yesterday.setDate(yesterday.getDate() - 1);
                                                
                                                if (e.target.value === 'today') {
                                                    return returnDate.toDateString() === today.toDateString();
                                                } else if (e.target.value === 'yesterday') {
                                                    return returnDate.toDateString() === yesterday.toDateString();
                                                } else if (e.target.value === 'thisWeek') {
                                                    const weekStart = new Date(today);
                                                    weekStart.setDate(today.getDate() - today.getDay());
                                                    return returnDate >= weekStart;
                                                } else if (e.target.value === 'thisMonth') {
                                                    return returnDate.getMonth() === today.getMonth() && 
                                                           returnDate.getFullYear() === today.getFullYear();
                                                }
                                                return true;
                                            });
                                            setFilteredData(filtered);
                                        }
                                    }}
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="yesterday">Yesterday</option>
                                    <option value="thisWeek">This Week</option>
                                    <option value="thisMonth">This Month</option>
                                </select>
                            </div>
                            <button
                                className='flex items-center justify-center px-4 py-3 bg-blue-200 rounded-md text-blue-800 whitespace-nowrap hover:bg-blue-300'
                                onClick={() => toggleAdd(true)}
                            >
                                <IoIosAdd />
                                Add new Return
                            </button>
                        </div>
                    </div>
                </caption>
                <thead>
                    <tr className='text-black bg-gray-300'>
                        <th>#</th>
                        <th>Date</th>
                        <th>Products</th>
                        <th>Quantity</th>
                        <th>Reason</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan="6" className="text-center py-4">Loading...</td>
                        </tr>
                    ) : currentItems.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="text-center py-4">No returns found</td>
                        </tr>
                    ) : (
                        currentItems.map((item, index) => (
                            <tr key={index}>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>{toDate(item.createdAt)}</td>
                                <td>
                                    {item.products.map((product, i) => (
                                        <div key={i}>{product.product?.productName}</div>
                                    ))}
                                </td>
                                <td>
                                    {item.products.map((product, i) => (
                                        <div key={i}>{product.quantity}</div>
                                    ))}
                                </td>
                                <td>{item.notes}</td>
                                <td className='flex gap-2'>
                                    <button
                                        className='p-2 bg-blue-200 text-blue-800 rounded-md hover:bg-blue-300'
                                        onClick={() => handleUpdate(item)}
                                    >
                                        Update
                                    </button>
                                    <button
                                        className='p-2 bg-red-200 text-red-800 rounded-md hover:bg-red-300'
                                        onClick={(e) => handleDelete(e, item)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            {!isLoading && currentItems.length > 0 && renderPagination()}
        </div>
    );
};

export default Table;