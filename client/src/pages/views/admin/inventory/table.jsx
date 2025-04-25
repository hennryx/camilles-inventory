import React, { useEffect, useState } from 'react'
import { IoIosAdd } from "react-icons/io";
import Swal from 'sweetalert2';
import { ENDPOINT } from '../../../../services/utilities';
import NoImage from "../../../../assets/No-Image.png"
import { Checkbox } from '@headlessui/react';
import useProductsStore from '../../../../services/stores/products/productsStore';
import useAuthStore from '../../../../services/stores/authStore';

const Table = ({ data, totalItems, toggleAdd, handleUpdate, setToggleReduce, setReduceProduct, isLoading, loadData }) => {
    const { deleteProduct } = useProductsStore();
    const { token } = useAuthStore()
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [selectedPrd, setSelectedPrd] = useState([])

    console.log("-----------", data, data.length);
    

    const handleDelete = (e, _id) => {
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
                await deleteProduct({_id}, token)
            }
        });
    }

    useEffect(() => {
        console.log(selectedPrd);
        
    }, [selectedPrd])

    useEffect(() => {
        loadData();
    }, [currentPage, itemsPerPage, searchTerm]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); 
    };

    const handleItemSelection = (item) => {
        if (Array.isArray(item)) {
            if (selectedPrd.length === data.length) {
                setSelectedPrd([]);
            } else {
                setSelectedPrd([...data]);
            }
        } else {
            const isSelected = selectedPrd.some(product => product._id === item._id);
            
            if (isSelected) {
                setSelectedPrd(selectedPrd.filter(product => product._id !== item._id));
            } else {
                setSelectedPrd([...selectedPrd, item]);
            }
        }
    };

    const openReduceDrawer = (productsToReduce = null) => {
        const productsForDrawer = productsToReduce || selectedPrd;
        
        if (productsForDrawer && productsForDrawer.length > 0) {
            setReduceProduct(productsForDrawer);
            setToggleReduce(true);
        }
    };


    // Calculate pagination numbers based on backend response
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const renderPagination = () => {
        const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
        const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

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
                            Showing <span className="font-medium">{totalItems > 0 ? indexOfFirstItem : 0}</span> to{" "}
                            <span className="font-medium">{indexOfLastItem}</span>{" "}
                            of <span className="font-medium">{totalItems}</span> results
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
                        <h3 className='text-xl'>Products</h3>
                        <div className='flex flex-row gap-4 justify-center items-center'>
                            <label className="input bg-transparent border-2 border-gray-500 rounded-md">
                                <svg className="h-4 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></g></svg>
                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Search"
                                />
                            </label>
                            <button
                                className='flex items-center justify-center px-4 py-3 bg-green-200 rounded-md text-green-800 whitespace-nowrap hover:bg-green-300'
                                onClick={() => toggleAdd((prev) => !prev)}
                            >
                                <IoIosAdd />
                                Add New Product
                            </button>

                            {selectedPrd.length > 0 && (
                                <button
                                    className='flex items-center justify-center px-4 py-3 bg-green-200 rounded-md text-green-800 whitespace-nowrap hover:bg-green-300'
                                    onClick={() => openReduceDrawer()}
                                >
                                    <IoIosAdd />
                                    Reduce {selectedPrd.length > 1 ? 'All' : 'Item'} ({selectedPrd.length})
                                </button>
                            )}
                        </div>
                    </div>
                </caption>
                <thead>
                    <tr className='text-black bg-gray-300'>
                        <th>
                            <Checkbox
                                checked={selectedPrd.length === data.length && data.length > 0}
                                onChange={() => handleItemSelection(data)}
                                className="group block size-4 rounded-full bg-white border border-gray-400 data-[checked]:bg-blue-200"
                            >
                                <svg className="stroke-blue-800 opacity-0 group-data-[checked]:opacity-100" viewBox="0 0 14 14" fill="none">
                                    <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Checkbox>
                        </th>
                        <th>#</th>
                        <th>image</th>
                        <th>product</th>
                        <th>Size</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody className='text-gray-500'>
                    {isLoading ? (
                        <tr>
                            <td colSpan={5} className='text-center py-4 text-gray-500'>Loading...</td>
                        </tr>
                    ) : data && data.length > 0 ? (
                        data.map((item, i) => (
                            <tr key={i}>
                                <td>
                                    <Checkbox
                                        checked={selectedPrd?.some((prd) => prd._id === item._id)}
                                        onChange={() => handleItemSelection(item)}
                                        className="group block size-4 rounded-full bg-white border border-gray-400 data-[checked]:bg-blue-200"
                                    >
                                        <svg className="stroke-blue-800 opacity-0 group-data-[checked]:opacity-100" viewBox="0 0 14 14" fill="none">
                                            <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </Checkbox>
                                </td>
                                <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                                <td>
                                    <img
                                        className='h-15 w-15 object-fill rounded-md'
                                        src={`${ENDPOINT}/assets/products/${item.image}`}
                                        alt="image"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = NoImage
                                        }}
                                    />
                                </td>
                                <td>{item.productName}</td>
                                <td>{item.unitSize + " " + item.unit}</td>
                                <td>{item.sellingPrice}</td>
                                <td>{item.inStock}</td>
                                <td className='flex flex-row justify-start items-center gap-2 p-2'>
                                    <button
                                        className='p-2 bg-blue-200 text-blue-800 rounded-md hover:bg-blue-300'
                                        onClick={() => handleUpdate(item)}
                                    >
                                        Update
                                    </button>
                                    <button
                                        className='p-2 bg-red-200 text-red-800 rounded-md hover:bg-red-300'
                                        onClick={(e) => handleDelete(e, item._id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className='text-center py-4 text-gray-500'>No results found</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {renderPagination()}
        </div>
    )
}

export default Table