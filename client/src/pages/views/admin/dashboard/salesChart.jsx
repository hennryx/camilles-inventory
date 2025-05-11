import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const SalesChart = ({ timeFilter, transactionData }) => {
    const chartRef = useRef(null);
    const canvasRef = useRef(null);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (transactionData && transactionData.length > 0) {
            processChartData();
        }
    }, [transactionData, timeFilter]);

    const processChartData = () => {
        const salesTransactions = transactionData.filter(
            transaction => transaction.transactionType === 'SALE'
        );

        const now = new Date();
        let labels = [];
        let salesData = [];

        if (timeFilter === 'day') {
            labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const todayTransactions = salesTransactions.filter(transaction => {
                const txDate = new Date(transaction.createdAt);
                return txDate >= today;
            });
            
            salesData = Array(24).fill(0);
            
            todayTransactions.forEach(transaction => {
                const txDate = new Date(transaction.createdAt);
                const hour = txDate.getHours();
                
                const total = transaction.products.reduce((sum, product) => {
                    return sum + (product.quantity * (product.product?.sellingPrice || 0));
                }, 0);
                
                salesData[hour] += total;
            });
        } else if (timeFilter === 'month') {
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
            
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            
            const monthTransactions = salesTransactions.filter(transaction => {
                const txDate = new Date(transaction.createdAt);
                return txDate >= thisMonth;
            });
            
            salesData = Array(daysInMonth).fill(0);
            
            monthTransactions.forEach(transaction => {
                const txDate = new Date(transaction.createdAt);
                const day = txDate.getDate() - 1; 
                
                const total = transaction.products.reduce((sum, product) => {
                    return sum + (product.quantity * (product.product?.sellingPrice || 0));
                }, 0);
                
                salesData[day] += total;
            });
        } else if (timeFilter === 'year') {
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            const thisYear = new Date(now.getFullYear(), 0, 1);
            
            const yearTransactions = salesTransactions.filter(transaction => {
                const txDate = new Date(transaction.createdAt);
                return txDate >= thisYear;
            });
            
            salesData = Array(12).fill(0);
            
            yearTransactions.forEach(transaction => {
                const txDate = new Date(transaction.createdAt);
                const month = txDate.getMonth();
                
                const total = transaction.products.reduce((sum, product) => {
                    return sum + (product.quantity * (product.product?.sellingPrice || 0));
                }, 0);
                
                salesData[month] += total;
            });
        }
        
        setChartData({ labels, salesData });
    };

    useEffect(() => {
        if (chartData.labels && chartData.salesData) {
            if (chartRef.current) {
                chartRef.current.destroy();
            }

            const ctx = canvasRef.current.getContext('2d');
            
            chartRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Sales (₱)',
                        data: chartData.salesData,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '₱' + value;
                                }
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: `Sales Overview - ${timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}`,
                            font: {
                                size: 16
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return '₱' + context.parsed.y;
                                }
                            }
                        }
                    }
                }
            });
        }

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [chartData]);

    return (
        <div className="h-80">
            <canvas ref={canvasRef} className='w-full'></canvas>
        </div>
    );
};

export default SalesChart;