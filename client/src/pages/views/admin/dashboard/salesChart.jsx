import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const SalesChart = ({ timeFilter, transactionData, dateRange }) => {
    const chartRef = useRef(null);
    const canvasRef = useRef(null);
    const [chartData, setChartData] = useState({ labels: [], salesData: [] });

    useEffect(() => {        
        if (transactionData && transactionData.length > 0) {
            processChartData();
        }
    }, [transactionData, timeFilter, dateRange]);

    const processChartData = () => {
        const now = new Date();
        const salesTransactions = transactionData.filter(t => t.transactionType === 'SALE');
        let labels = [], salesData = [];
        
        // If custom date range is provided
        if (dateRange && dateRange.startDate && dateRange.endDate) {
            const startDate = new Date(dateRange.startDate);
            const endDate = new Date(dateRange.endDate);
            endDate.setHours(23, 59, 59, 999); // End of the day
            
            // Calculate number of days in range
            const dayDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            
            // Generate labels for each day in range
            labels = Array.from({ length: dayDiff + 1 }, (_, i) => {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
            
            // Initialize salesData array with zeros
            salesData = Array(labels.length).fill(0);
            
            // Populate sales data
            salesTransactions.forEach(({ createdAt, products }) => {
                const txDate = new Date(createdAt);
                if (txDate >= startDate && txDate <= endDate) {
                    const dayIndex = Math.floor((txDate - startDate) / (1000 * 60 * 60 * 24));
                    const total = products.reduce((sum, p) => sum + (p.quantity * (p.product?.sellingPrice || 0)), 0);
                    if (dayIndex >= 0 && dayIndex < salesData.length) {
                        salesData[dayIndex] += total;
                    }
                }
            });
        } else if (timeFilter === 'day') {
            labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
            const today = new Date(); today.setHours(0, 0, 0, 0);

            salesData = Array(24).fill(0);
            salesTransactions.forEach(({ createdAt, products }) => {
                const txDate = new Date(createdAt);
                if (txDate >= today) {
                    const hour = txDate.getHours();
                    const total = products.reduce((sum, p) => sum + (p.quantity * (p.product?.sellingPrice || 0)), 0);
                    salesData[hour] += total;
                }
            });
        } else if (timeFilter === 'month') {
            const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            labels = Array.from({ length: days }, (_, i) => `${i + 1}`);
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

            salesData = Array(days).fill(0);
            salesTransactions.forEach(({ createdAt, products }) => {
                const txDate = new Date(createdAt);
                if (txDate >= monthStart) {
                    const day = txDate.getDate() - 1;
                    const total = products.reduce((sum, p) => sum + (p.quantity * (p.product?.sellingPrice || 0)), 0);
                    salesData[day] += total;
                }
            });
        } else if (timeFilter === 'year') {
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const yearStart = new Date(now.getFullYear(), 0, 1);

            salesData = Array(12).fill(0);
            salesTransactions.forEach(({ createdAt, products }) => {
                const txDate = new Date(createdAt);
                if (txDate >= yearStart) {
                    const month = txDate.getMonth();
                    const total = products.reduce((sum, p) => sum + (p.quantity * (p.product?.sellingPrice || 0)), 0);
                    salesData[month] += total;
                }
            });
        }

        setChartData({ labels, salesData });
    };

    useEffect(() => {
        if (!canvasRef.current || !chartData.labels.length) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new Chart(canvasRef.current, {
            type: 'line', // Changed from 'bar' to 'line'
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Sales (₱)',
                    data: chartData.salesData,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)', // More transparency for area fill
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2, // Slightly thicker line
                    tension: 0.3, // Adding curve to the line
                    fill: true, // Fill area under the line
                    pointRadius: 3, // Add visible points
                    pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => `₱${value}`
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: dateRange && dateRange.startDate && dateRange.endDate 
                            ? `Sales from ${new Date(dateRange.startDate).toLocaleDateString()} to ${new Date(dateRange.endDate).toLocaleDateString()}`
                            : `Sales Overview - ${timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}`,
                        font: { size: 18 }
                    },
                    tooltip: {
                        callbacks: {
                            label: ctx => `₱${ctx.parsed.y}`
                        }
                    },
                    legend: { display: false }
                }
            }
        });

        return () => {
            if (chartRef.current) chartRef.current.destroy();
        };
    }, [chartData, dateRange]);

    return (
        <div className="h-110">
            <canvas ref={canvasRef} className="w-full"></canvas>
        </div>
    );
};

export default SalesChart;