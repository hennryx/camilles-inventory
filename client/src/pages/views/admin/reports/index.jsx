// client/src/pages/views/admin/reports/index.jsx
import React, { useState, useEffect } from 'react';
import { FaFilePdf, FaRegListAlt } from 'react-icons/fa';
import useAuthStore from '../../../../services/stores/authStore';
import useProductsStore from '../../../../services/stores/products/productsStore';
import useTransactionsStore from '../../../../services/stores/transactions/transactionStore';
import usePurchaseStore from '../../../../services/stores/purchase/purchaseStore';
import { toast } from 'react-toastify';
import html2pdf from 'html2pdf.js';

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
    
    const handleDateRangeChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const generatePDF = () => {
        // Create a temporary element to render the report
        const element = document.createElement('div');
        element.style.padding = '20px';
        element.style.fontFamily = 'Arial, sans-serif';
        
        // Add title and date range
        const title = document.createElement('h1');
        title.textContent = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
        title.style.color = '#4154F1';
        title.style.marginBottom = '10px';
        element.appendChild(title);
        
        const dateInfo = document.createElement('p');
        dateInfo.textContent = `Date Range: ${new Date(dateRange.startDate).toLocaleDateString()} to ${new Date(dateRange.endDate).toLocaleDateString()}`;
        dateInfo.style.marginBottom = '20px';
        element.appendChild(dateInfo);
        
        // Create table
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        
        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.style.backgroundColor = '#4154F1';
        headerRow.style.color = 'white';
        
        // Define columns based on report type
        let columns = [];
        
        if (reportType === 'sales') {
            columns = ['Date', 'Product', 'Quantity', 'Total'];
        } else if (reportType === 'purchases') {
            columns = ['Date', 'Supplier', 'Products', 'Total Items'];
        } else if (reportType === 'returns') {
            columns = ['Date', 'Product', 'Quantity', 'Reason'];
        } else if (reportType === 'inventory') {
            columns = ['Product Name', 'Size', 'Price', 'In Stock'];
        }
        
        columns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column;
            th.style.padding = '8px';
            th.style.textAlign = 'left';
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        filteredData.forEach((item, index) => {
            const row = document.createElement('tr');
            row.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : 'white';
            
            // Add cells based on report type
            if (reportType === 'sales') {
                const dateCell = document.createElement('td');
                dateCell.textContent = new Date(item.createdAt).toLocaleDateString();
                row.appendChild(dateCell);
                
                const productCell = document.createElement('td');
                productCell.textContent = item.products.map(p => p.product?.productName).join(', ');
                row.appendChild(productCell);
                
                const quantityCell = document.createElement('td');
                quantityCell.textContent = item.products.map(p => p.quantity).reduce((a, b) => a + b, 0);
                row.appendChild(quantityCell);
                
                const totalCell = document.createElement('td');
                totalCell.textContent = `₱${item.products.map(p => p.quantity * (p.product?.sellingPrice || 0)).reduce((a, b) => a + b, 0)}`;
                row.appendChild(totalCell);
            } else if (reportType === 'purchases') {
                const dateCell = document.createElement('td');
                dateCell.textContent = new Date(item.purchaseDate).toLocaleDateString();
                row.appendChild(dateCell);
                
                const supplierCell = document.createElement('td');
                supplierCell.textContent = item.supplier?.companyName || 'N/A';
                row.appendChild(supplierCell);
                
                const productsCell = document.createElement('td');
                productsCell.textContent = item.products?.map(p => p.product?.productName).join(', ');
                row.appendChild(productsCell);
                
                const totalItemsCell = document.createElement('td');
                totalItemsCell.textContent = item.products?.length || 0;
                row.appendChild(totalItemsCell);
            } else if (reportType === 'returns') {
                const dateCell = document.createElement('td');
                dateCell.textContent = new Date(item.createdAt).toLocaleDateString();
                row.appendChild(dateCell);
                
                const productCell = document.createElement('td');
                productCell.textContent = item.products.map(p => p.product?.productName).join(', ');
                row.appendChild(productCell);
                
                const quantityCell = document.createElement('td');
                quantityCell.textContent = item.products.map(p => p.quantity).reduce((a, b) => a + b, 0);
                row.appendChild(quantityCell);
                
                const reasonCell = document.createElement('td');
                reasonCell.textContent = item.notes || 'N/A';
                row.appendChild(reasonCell);
            } else if (reportType === 'inventory') {
                const nameCell = document.createElement('td');
                nameCell.textContent = item.productName;
                row.appendChild(nameCell);
                
                const sizeCell = document.createElement('td');
                sizeCell.textContent = `${item.unitSize} ${item.unit}`;
                row.appendChild(sizeCell);
                
                const priceCell = document.createElement('td');
                priceCell.textContent = `₱${item.sellingPrice}`;
                row.appendChild(priceCell);
                
                const stockCell = document.createElement('td');
                stockCell.textContent = item.inStock || 0;
                row.appendChild(stockCell);
            }
            
            // Style the cells
            Array.from(row.cells).forEach(cell => {
                cell.style.padding = '8px';
                cell.style.borderBottom = '1px solid #ddd';
            });
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        element.appendChild(table);
        
        // Generate summary section
        const summary = document.createElement('div');
        summary.style.marginTop = '20px';
        summary.style.padding = '10px';
        summary.style.backgroundColor = '#f5f5f5';
        summary.style.borderRadius = '5px';
        
        const summaryTitle = document.createElement('h2');
        summaryTitle.textContent = 'Summary';
        summaryTitle.style.fontSize = '16px';
        summaryTitle.style.marginBottom = '10px';
        summary.appendChild(summaryTitle);
        
        const summaryContent = document.createElement('p');
        if (reportType === 'sales') {
            const totalSales = filteredData.reduce((sum, item) => {
                return sum + item.products.reduce((productSum, p) => {
                    return productSum + (p.quantity * (p.product?.sellingPrice || 0));
                }, 0);
            }, 0);
            summaryContent.textContent = `Total Sales: ₱${totalSales.toFixed(2)}`;
        } else if (reportType === 'purchases') {
            const totalItems = filteredData.reduce((sum, item) => {
                return sum + (item.products?.length || 0);
            }, 0);
            summaryContent.textContent = `Total Items Purchased: ${totalItems}`;
        } else if (reportType === 'returns') {
            const totalReturned = filteredData.reduce((sum, item) => {
                return sum + item.products.reduce((productSum, p) => {
                    return productSum + p.quantity;
                }, 0);
            }, 0);
            summaryContent.textContent = `Total Items Returned: ${totalReturned}`;
        } else if (reportType === 'inventory') {
            const totalStock = filteredData.reduce((sum, item) => {
                return sum + (item.inStock || 0);
            }, 0);
            summaryContent.textContent = `Total Items in Stock: ${totalStock}`;
        }
        
        summary.appendChild(summaryContent);
        element.appendChild(summary);
        
        // Generate PDF from the element
        const opt = {
            margin: 10,
            filename: `${reportType}_report_${new Date().toISOString().slice(0, 10)}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().from(element).set(opt).save()
            .then(() => {
                toast.success('PDF generated successfully');
            })
            .catch(error => {
                console.error('PDF generation error:', error);
                toast.error('Failed to generate PDF');
            });
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
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date Range
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500">From</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={dateRange.startDate}
                                        onChange={handleDateRangeChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500">To</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={dateRange.endDate}
                                        onChange={handleDateRangeChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
                                    />
                                </div>
                            </div>
                        </div>
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
                    
                    {/* Summary section */}
                    {filteredData.length > 0 && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Summary</h3>
                            
                            {reportType === 'sales' && (
                                <p className="text-gray-700">
                                    Total Sales: ₱{filteredData.reduce((sum, item) => {
                                        return sum + item.products.reduce((productSum, p) => {
                                            return productSum + (p.quantity * (p.product?.sellingPrice || 0));
                                        }, 0);
                                    }, 0).toFixed(2)}
                                </p>
                            )}
                            
                            {reportType === 'purchases' && (
                                <p className="text-gray-700">
                                    Total Items Purchased: {filteredData.reduce((sum, item) => {
                                        return sum + (item.products?.length || 0);
                                    }, 0)}
                                </p>
                            )}
                            
                            {reportType === 'returns' && (
                                <p className="text-gray-700">
                                    Total Items Returned: {filteredData.reduce((sum, item) => {
                                        return sum + item.products.reduce((productSum, p) => {
                                            return productSum + p.quantity;
                                        }, 0);
                                    }, 0)}
                                </p>
                            )}
                            
                            {reportType === 'inventory' && (
                                <p className="text-gray-700">
                                    Total Items in Stock: {filteredData.reduce((sum, item) => {
                                        return sum + (item.inStock || 0);
                                    }, 0)}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;