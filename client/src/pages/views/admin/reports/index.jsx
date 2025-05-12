import React, { useState, useEffect, useRef } from 'react';
import 'jspdf-autotable';
import useAuthStore from '../../../../services/stores/authStore';
import useProductsStore from '../../../../services/stores/products/productsStore';
import useTransactionsStore from '../../../../services/stores/transactions/transactionStore';
import usePurchaseStore from '../../../../services/stores/purchase/purchaseStore';
import ReportFilter from './reportFilter';
import ReportVisualization from './reportVisualization';
import { FaFilePdf, FaFileExcel, FaRegListAlt, FaChartBar } from 'react-icons/fa';

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
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    const reportTableRef = useRef(null);
    const reportHeaderRef = useRef(null);

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

    const visualizationRef = useRef(null);

    const generatePDF = async () => {
        if (!reportTableRef.current || !reportHeaderRef.current) return;

        setIsGeneratingReport(true);

        try {
            const pdfUtils = await import('../../../../services/utilities/pdfUtils');

            const title = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;

            const elements = [
                {
                    element: reportHeaderRef.current,
                    config: { scale: 2 }
                }
            ];

            if (showVisualization && visualizationRef.current) {
                elements.push({
                    element: visualizationRef.current,
                    config: { scale: 2 }
                });
            }

            elements.push({
                element: reportTableRef.current,
                config: { scale: 2 }
            });

            await pdfUtils.generatePDFFromElements({
                elements,
                filename: `${reportType}_report_${new Date().toISOString().slice(0, 10)}.pdf`,
                format: 'a4',
                orientation: 'portrait'
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const exportToCSV = async () => {
        try {
            const pdfUtils = await import('../../../../services/utilities/pdfUtils');

            let headerConfig = [];
            let formattedData = [];

            if (reportType === 'sales') {
                headerConfig = [
                    { key: 'date', label: 'Date' },
                    { key: 'product', label: 'Product' },
                    { key: 'quantity', label: 'Quantity' },
                    { key: 'total', label: 'Total' }
                ];

                formattedData = filteredData.map(item => ({
                    date: new Date(item.createdAt).toLocaleDateString(),
                    product: item.products.map(p => p.product?.productName).join(' | '),
                    quantity: item.products.map(p => p.quantity).reduce((a, b) => a + b, 0),
                    total: item.products.map(p => p.quantity * (p.product?.sellingPrice || 0)).reduce((a, b) => a + b, 0)
                }));
            } else if (reportType === 'purchases') {
                headerConfig = [
                    { key: 'date', label: 'Date' },
                    { key: 'supplier', label: 'Supplier' },
                    { key: 'products', label: 'Products' },
                    { key: 'totalItems', label: 'Total Items' }
                ];

                formattedData = filteredData.map(item => ({
                    date: new Date(item.purchaseDate).toLocaleDateString(),
                    supplier: item.supplier?.companyName || 'N/A',
                    products: item.products?.map(p => p.product?.productName).join(' | '),
                    totalItems: item.products?.length || 0
                }));
            } else if (reportType === 'inventory') {
                headerConfig = [
                    { key: 'productName', label: 'Product Name' },
                    { key: 'size', label: 'Size' },
                    { key: 'price', label: 'Price' },
                    { key: 'inStock', label: 'In Stock' }
                ];

                formattedData = filteredData.map(item => ({
                    productName: item.productName,
                    size: `${item.unitSize} ${item.unit}`,
                    price: item.sellingPrice,
                    inStock: item.inStock || 0
                }));
            } else if (reportType === 'returns') {
                headerConfig = [
                    { key: 'date', label: 'Date' },
                    { key: 'product', label: 'Product' },
                    { key: 'quantity', label: 'Quantity' },
                    { key: 'reason', label: 'Reason' }
                ];

                formattedData = filteredData.map(item => ({
                    date: new Date(item.createdAt).toLocaleDateString(),
                    product: item.products.map(p => p.product?.productName).join(' | '),
                    quantity: item.products.map(p => p.quantity).reduce((a, b) => a + b, 0),
                    reason: item.notes || 'N/A'
                }));
            }

            pdfUtils.exportToCSV(
                formattedData,
                headerConfig,
                `${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`
            );
        } catch (error) {
            console.error('Error exporting CSV:', error);
        }
    };

    const renderReportHeader = () => {
        const title = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
        const dateStr = `Date Range: ${dateRange.startDate} to ${dateRange.endDate}`;

        return (
            <div ref={reportHeaderRef} className="mb-4 py-4 bg-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-blue-600 mb-2">{title}</h1>
                    <p className="text-gray-600">{dateStr}</p>
                </div>
            </div>
        );
    };

    const [showVisualization, setShowVisualization] = useState(false);

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

                    <div className="flex flex-wrap space-x-4 mb-6">
                        <button
                            onClick={generatePDF}
                            disabled={isGeneratingReport}
                            className="inline-flex items-center px-4 py-2 bg-red-100 border border-transparent rounded-md font-semibold text-xs text-red-700 uppercase tracking-widest hover:bg-red-200 active:bg-red-300 focus:outline-none focus:border-red-300 focus:ring ring-red-200 disabled:opacity-25 transition ease-in-out duration-150"
                        >
                            <FaFilePdf className="mr-2" />
                            {isGeneratingReport ? 'Generating...' : 'Export as PDF'}
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

                        <button
                            onClick={() => setShowVisualization(!showVisualization)}
                            className="inline-flex items-center px-4 py-2 bg-purple-100 border border-transparent rounded-md font-semibold text-xs text-purple-700 uppercase tracking-widest hover:bg-purple-200 active:bg-purple-300 focus:outline-none focus:border-purple-300 focus:ring ring-purple-200 disabled:opacity-25 transition ease-in-out duration-150"
                        >
                            <FaChartBar className="mr-2" />
                            {showVisualization ? 'Hide Visualization' : 'Show Visualization'}
                        </button>
                    </div>

                    {showVisualization && (
                        <div ref={visualizationRef}>
                            <ReportVisualization
                                reportType={reportType}
                                data={filteredData}
                            />
                        </div>
                    )}

                    {renderReportHeader()}

                    <div ref={reportTableRef} className="overflow-x-auto bg-white shadow-inner rounded-lg">
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
                                    filteredData?.map((item, index) => {
                                        console.log(index);

                                        return (
                                            <tr key={index}>
                                                {reportType === 'sales' && (
                                                    <>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {item.products?.map(p => p.product?.productName).join(', ')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {item.products?.map(p => Number(p.quantity) || 0).reduce((a, b) => a + b, 0)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            ₱{item.products?.map(p => (Number(p.quantity) || 0) * (Number(p.product?.sellingPrice) || 0)).reduce((a, b) => a + b, 0)}
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
                                                            {item.products?.map(p => p.product?.productName).join(', ')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {item.products?.map(p => Number(p.quantity) || 0).reduce((a, b) => a + b, 0)}
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
                                        )
                                    })
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