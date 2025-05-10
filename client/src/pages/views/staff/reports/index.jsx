// client/src/pages/views/admin/reports/index.jsx
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import useAuthStore from '../../../../services/stores/authStore';
import useProductsStore from '../../../../services/stores/products/productsStore';
import useTransactionsStore from '../../../../services/stores/transactions/transactionStore';
import usePurchaseStore from '../../../../services/stores/purchase/purchaseStore';
import ReportFilter from './reportFilter';
import { FaFilePdf, FaFileExcel, FaRegListAlt } from 'react-icons/fa';

const Reports = () => {
    const { token } = useAuthStore();
    const { data: productsData, getProducts } = useProductsStore();
    const { data: transactionsData, getTransactions } = useTransactionsStore();
    const { data: purchasesData, getPurchases } = usePurchaseStore();
    
    const [reportType, setReportType] = useState('sales');
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [filteredData, setFilteredData] = useState([]);
    
    useEffect(() => {
        if (token) {
            getProducts(token);
            getTransactions(token);
            getPurchases(token);
        }
    }, [token]);
    
    useEffect(() => {
        filterReportData();
    }, [reportType, dateRange, transactionsData, purchasesData, productsData]);
    
    const filterReportData = () => {
        if (reportType === 'sales') {
            const salesData = transactionsData?.filter(transaction => 
                transaction.transactionType === 'SALE' && 
                new Date(transaction.createdAt) >= new Date(dateRange.startDate) &&
                new Date(transaction.createdAt) <= new Date(dateRange.endDate)
            );
            setFilteredData(salesData || []);
        } else if (reportType === 'purchases') {
            const purchaseData = purchasesData?.filter(purchase => 
                new Date(purchase.purchaseDate) >= new Date(dateRange.startDate) &&
                new Date(purchase.purchaseDate) <= new Date(dateRange.endDate)
            );
            setFilteredData(purchaseData || []);
        } else if (reportType === 'returns') {
            const returnsData = transactionsData?.filter(transaction => 
                transaction.transactionType === 'RETURN' && 
                new Date(transaction.createdAt) >= new Date(dateRange.startDate) &&
                new Date(transaction.createdAt) <= new Date(dateRange.endDate)
            );
            setFilteredData(returnsData || []);
        } else if (reportType === 'inventory') {
            setFilteredData(productsData || []);
        }
    };
    
    const generatePDF = () => {
        const doc = new jsPDF();
        const title = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
        const dateStr = `${dateRange.startDate} to ${dateRange.endDate}`;
        
        // Add title
        doc.setFontSize(18);
        doc.text(title, 14, 22);
        
        // Add date range
        doc.setFontSize(11);
        doc.text(`Date Range: ${dateStr}`, 14, 30);
        
        let tableData = [];
        let columns = [];
        
        if (reportType === 'sales') {
            columns = [
                { header: 'Date', dataKey: 'date' },
                { header: 'Product', dataKey: 'product' },
                { header: 'Quantity', dataKey: 'quantity' },
                { header: 'Total', dataKey: 'total' }
            ];
            
            tableData = filteredData.map(item => {
                return {
                    date: new Date(item.createdAt).toLocaleDateString(),
                    product: item.products.map(p => p.product?.productName).join(', '),
                    quantity: item.products.map(p => p.quantity).reduce((a, b) => a + b, 0),
                    total: `₱${item.products.map(p => p.quantity * (p.product?.sellingPrice || 0)).reduce((a, b) => a + b, 0)}`
                };
            });
        } else if (reportType === 'purchases') {
            columns = [
                { header: 'Date', dataKey: 'date' },
                { header: 'Supplier', dataKey: 'supplier' },
                { header: 'Products', dataKey: 'products' },
                { header: 'Total Items', dataKey: 'totalItems' }
            ];
            
            tableData = filteredData.map(item => {
                return {
                    date: new Date(item.purchaseDate).toLocaleDateString(),
                    supplier: item.supplier?.companyName || 'N/A',
                    products: item.products?.map(p => p.product?.productName).join(', '),
                    totalItems: item.products?.length || 0
                };
            });
        } else if (reportType === 'inventory') {
            columns = [
                { header: 'Product Name', dataKey: 'name' },
                { header: 'Size', dataKey: 'size' },
                { header: 'Price', dataKey: 'price' },
                { header: 'In Stock', dataKey: 'stock' }
            ];
            
            tableData = filteredData.map(item => {
                return {
                    name: item.productName,
                    size: `${item.unitSize} ${item.unit}`,
                    price: `₱${item.sellingPrice}`,
                    stock: item.inStock || 0
                };
            });
        }
        
        doc.autoTable({
            head: [columns.map(col => col.header)],
            body: tableData.map(item => columns.map(col => item[col.dataKey])),
            startY: 40,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [65, 84, 241] }
        });
        
        doc.save(`${reportType}_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    };
    
    const exportToCSV = () => {
        let csvContent = '';
        let headers = [];
        
        if (reportType === 'sales') {
            headers = ['Date', 'Product', 'Quantity', 'Total'];
            csvContent = headers.join(',') + '\n';
            
            filteredData.forEach(item => {
                const row = [
                    new Date(item.createdAt).toLocaleDateString(),
                    item.products.map(p => p.product?.productName).join(' | '),
                    item.products.map(p => p.quantity).reduce((a, b) => a + b, 0),
                    item.products.map(p => p.quantity * (p.product?.sellingPrice || 0)).reduce((a, b) => a + b, 0)
                ];
                csvContent += row.join(',') + '\n';
            });
        } else if (reportType === 'purchases') {
            headers = ['Date', 'Supplier', 'Products', 'Total Items'];
            csvContent = headers.join(',') + '\n';
            
            filteredData.forEach(item => {
                const row = [
                    new Date(item.purchaseDate).toLocaleDateString(),
                    item.supplier?.companyName || 'N/A',
                    item.products?.map(p => p.product?.productName).join(' | '),
                    item.products?.length || 0
                ];
                csvContent += row.join(',') + '\n';
            });
        } else if (reportType === 'inventory') {
            headers = ['Product Name', 'Size', 'Price', 'In Stock'];
            csvContent = headers.join(',') + '\n';
            
            filteredData.forEach(item => {
                const row = [
                    item.productName,
                    `${item.unitSize} ${item.unit}`,
                    item.sellingPrice,
                    item.inStock || 0
                ];
                csvContent += row.join(',') + '\n';
            });
        }
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    return (
        <div className='container'>
            <div className="flex flex-col gap-5 pt-4">
                <div className=''>
                    <h2 className='text-xl text-[#4154F1]'>Reports</h2>
                    <p className='text-sm text-[#989797]'>Reports / Generate Reports</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-lg font-semibold mb-4">Generate Reports</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Report Type
                            </label>
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            >
                                <option value="sales">Sales Report</option>
                                <option value="purchases">Purchases Report</option>
                                <option value="returns">Returns Report</option>
                                <option value="inventory">Inventory Report</option>
                            </select>
                        </div>
                        
                        <ReportFilter dateRange={dateRange} setDateRange={setDateRange} />
                    </div>
                    
                    <div className="flex space-x-4 mb-6">
                        <button
                            onClick={generatePDF}
                            className="inline-flex items-center px-4 py-2 bg-red-100 border border-transparent rounded-md font-semibold text-xs text-red-700 uppercase tracking-widest hover:bg-red-200 active:bg-red-300 focus:outline-none focus:border-red-300 focus:ring ring-red-200 disabled:opacity-25 transition ease-in-out duration-150"
                        >
                            <FaFilePdf className="mr-2" />
                            Export as PDF
                        </button>
                        
                        <button
                            onClick={exportToCSV}
                            className="inline-flex items-center px-4 py-2 bg-green-100 border border-transparent rounded-md font-semibold text-xs text-green-700 uppercase tracking-widest hover:bg-green-200 active:bg-green-300 focus:outline-none focus:border-green-300 focus:ring ring-green-200 disabled:opacity-25 transition ease-in-out duration-150"
                        >
                            <FaFileExcel className="mr-2" />
                            Export as CSV
                        </button>
                        
                        <button
                            onClick={filterReportData}
                            className="inline-flex items-center px-4 py-2 bg-blue-100 border border-transparent rounded-md font-semibold text-xs text-blue-700 uppercase tracking-widest hover:bg-blue-200 active:bg-blue-300 focus:outline-none focus:border-blue-300 focus:ring ring-blue-200 disabled:opacity-25 transition ease-in-out duration-150"
                        >
                            <FaRegListAlt className="mr-2" />
                            Update Report
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto bg-white shadow-inner rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {reportType === 'sales' && (
                                        <>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        </>
                                    )}
                                    
                                    {reportType === 'purchases' && (
                                        <>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Items</th>
                                        </>
                                    )}
                                    
                                    {reportType === 'returns' && (
                                        <>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                        </>
                                    )}
                                    
                                    {reportType === 'inventory' && (
                                        <>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Stock</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                            No data available for the selected criteria
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((item, index) => (
                                        <tr key={index}>
                                            {reportType === 'sales' && (
                                                <>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.products.map(p => p.product?.productName).join(', ')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.products.map(p => p.quantity).reduce((a, b) => a + b, 0)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        ₱{item.products.map(p => p.quantity * (p.product?.sellingPrice || 0)).reduce((a, b) => a + b, 0)}
                                                    </td>
                                                </>
                                            )}
                                            
                                            {reportType === 'purchases' && (
                                                <>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.purchaseDate).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.supplier?.companyName || 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.products?.map(p => p.product?.productName).join(', ')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.products?.length || 0}</td>
                                                </>
                                            )}
                                            
                                            {reportType === 'returns' && (
                                                <>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.products.map(p => p.product?.productName).join(', ')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.products.map(p => p.quantity).reduce((a, b) => a + b, 0)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.notes || 'N/A'}</td>
                                                </>
                                            )}
                                            
                                            {reportType === 'inventory' && (
                                                <>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.productName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unitSize} {item.unit}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₱{item.sellingPrice}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.inStock || 0}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;