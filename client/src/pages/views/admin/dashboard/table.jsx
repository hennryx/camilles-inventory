// client/src/pages/views/admin/dashboard/table.jsx
import React, { useEffect, useState } from 'react'
import useAuthStore from '../../../../services/stores/authStore';
import useTransactionsStore from '../../../../services/stores/transactions/transactionStore';
import FilterMenu from '../../../../components/filterMenu';
import toDate from '../../../../services/utilities/convertDate';

const Table = () => {
    const [searchResult, setSearchResult] = useState("")
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        date: { start: '', end: '' },
        transactionType: ''
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const { token } = useAuthStore();
    const { getTransactions, data } = useTransactionsStore();
    const [allData, setAllData] = useState([]);

    // Filter options
    const filterOptions = {
        date: {
            type: 'date',
            label: 'Transaction Date',
        },
        transactionType: {
            type: 'select',
            label: 'Transaction Type',
            choices: [
                { label: 'Purchase', value: 'PURCHASE' },
                { label: 'Sale', value: 'SALE' },
                { label: 'Damage', value: 'DAMAGE' },
                { label: 'Return', value: 'RETURN' }
            ]
        }
    };

    useEffect(() => {
        if (token) {
            getTransactions(token)
        }
    }, [token]);

    useEffect(() => {
        if (data) {
            setAllData(data);
        }
    }, [data]);

    // Apply filters and search
    const applyFilters = () => {
        if (!data) return;
        
        let filteredData = [...data];
        
        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredData = filteredData.filter(item =>
                item.suppliers?.some(supplier => 
                    supplier?.firstname?.toLowerCase().includes(term) ||
                    supplier?.middlename?.toLowerCase().includes(term) ||
                    supplier?.lastname?.toLowerCase().includes(term)
                ) ||
                item.transactionType?.toLowerCase().includes(term) ||
                item.products?.some(p => 
                    p.product?.productName?.toLowerCase().includes(term)
                )
            );
        }
        
        // Filter by date range
        if (filters.date.start || filters.date.end) {
            filteredData = filteredData.filter(item => {
                const createdAt = new Date(item.createdAt);
                
                if (filters.date.start && filters.date.end) {
                    const startDate = new Date(filters.date.start);
                    const endDate = new Date(filters.date.end);
                    endDate.setHours(23, 59, 59);
                    return createdAt >= startDate && createdAt <= endDate;
                } else if (filters.date.start) {
                    const startDate = new Date(filters.date.start);
                    return createdAt >= startDate;
                } else if (filters.date.end) {
                    const endDate = new Date(filters.date.end);
                    endDate.setHours(23, 59, 59);
                    return createdAt <= endDate;
                }
                
                return true;
            });
        }
        
        // Filter by transaction type
        if (filters.transactionType) {
            filteredData = filteredData.filter(item => 
                item.transactionType === filters.transactionType
            );
        }
        
        if (filteredData.length === 0 && (searchTerm || Object.values(filters).some(v => v !== ''))) {
            setSearchResult("No results match your filters");
        } else {
            setSearchResult("");
        }
        
        setAllData(filteredData);
        setCurrentPage(1);
    };

    // Handle filter changes
    const handleApplyFilter = (newFilters) => {
        setFilters(newFilters);
    };

    useEffect(() => {
        applyFilters();
    }, [searchTerm, filters, data]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = allData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(allData.length / itemsPerPage);

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
                                {indexOfLastItem > allData.length ? allData.length : indexOfLastItem}
                            </span>{" "}
                            of <span className="font-medium">{allData.length}</span> results
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
                                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
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
                        <h3 className='text-xl'>Transactions</h3>
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
                            <div className="relative">
                                <FilterMenu
                                    isOpen={isFilterOpen}
                                    toggleFilter={setIsFilterOpen}
                                    onApplyFilter={handleApplyFilter}
                                    filters={filters}
                                    filterOptions={filterOptions}
                                />
                            </div>
                        </div>
                    </div>
                </caption>
                <thead>
                    <tr className='text-black bg-gray-300'>
                        <th>#</th>
                        <th>Transaction</th>
                        <th>Products</th>
                        <th>Supplier</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody className='text-gray-500'>
                    {searchResult ? (
                        <tr>
                            <td colSpan={5} className='text-center py-4 text-gray-500'>{searchResult}</td>
                        </tr>
                    ) : (
                        currentItems.map((_data, i) => (
                            <tr key={i}>
                                <th>{indexOfFirstItem + i + 1}</th>
                                <td>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        _data.transactionType === 'PURCHASE' ? 'bg-blue-100 text-blue-800' :
                                        _data.transactionType === 'SALE' ? 'bg-green-100 text-green-800' :
                                        _data.transactionType === 'DAMAGE' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {_data.transactionType}
                                    </span>
                                </td>
                                <td className='flex flex-col gap-2'>{_data.products?.map((prd, x) => (
                                    <p key={x}>
                                        <span>{prd.product?.productName}</span> <br />
                                        <span>{prd.product?.unitSize} {prd.product?.unit}</span>
                                    </p>
                                ))}
                                </td>
                                <td>{_data?.suppliers[0]?.firstname || ""}</td>
                                <td>{_data.createdAt ? toDate(_data.createdAt) : ''}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            {!searchResult && renderPagination()}
        </div>
    )
}

export default Table