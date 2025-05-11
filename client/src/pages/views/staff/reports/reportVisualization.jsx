// client/src/pages/views/admin/reports/reportVisualization.jsx
import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';

const ReportVisualization = ({ reportType, data }) => {
  const canvasRef = React.useRef(null);
  const chartRef = React.useRef(null);
  const [summaryData, setSummaryData] = useState({
    total: 0,
    average: 0,
    count: 0,
    min: 0,
    max: 0
  });

  useEffect(() => {
    if (!data || data.length === 0 || !canvasRef.current) return;

    // Clean up previous chart if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Process data for visualization based on report type
    let processedData = {
      labels: [],
      datasets: [{
        label: '',
        data: [],
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1
      }]
    };

    let chartType = 'bar';
    let summary = { total: 0, count: data.length, min: Infinity, max: -Infinity };

    switch (reportType) {
      case 'sales':
        // Group sales by date
        const salesByDate = {};
        data.forEach(item => {
          const date = new Date(item.createdAt).toLocaleDateString();
          const amount = item.products.reduce((sum, p) => {
            return sum + (p.quantity * (p.product?.sellingPrice || 0));
          }, 0);
          
          if (!salesByDate[date]) {
            salesByDate[date] = 0;
          }
          salesByDate[date] += amount;
          
          summary.total += amount;
          summary.min = Math.min(summary.min, amount);
          summary.max = Math.max(summary.max, amount);
        });
        
        processedData.labels = Object.keys(salesByDate);
        processedData.datasets[0].data = Object.values(salesByDate);
        processedData.datasets[0].label = 'Sales Amount (₱)';
        chartType = 'line';
        break;

      case 'purchases':
        // Group purchases by supplier
        const purchasesBySupplier = {};
        data.forEach(item => {
          const supplier = item.supplier?.companyName || 'Unknown';
          
          if (!purchasesBySupplier[supplier]) {
            purchasesBySupplier[supplier] = 0;
          }
          
          const itemCount = item.products?.length || 0;
          purchasesBySupplier[supplier] += itemCount;
          
          summary.total += itemCount;
          summary.min = Math.min(summary.min, itemCount);
          summary.max = Math.max(summary.max, itemCount);
        });
        
        processedData.labels = Object.keys(purchasesBySupplier);
        processedData.datasets[0].data = Object.values(purchasesBySupplier);
        processedData.datasets[0].label = 'Number of Items';
        chartType = 'pie';
        break;
        
      case 'inventory':
        // Visualize product stock levels
        const sortedProducts = [...data]
          .sort((a, b) => (b.inStock || 0) - (a.inStock || 0))
          .slice(0, 10); // Show top 10 products by stock
          
        processedData.labels = sortedProducts.map(p => p.productName);
        processedData.datasets[0].data = sortedProducts.map(p => p.inStock || 0);
        processedData.datasets[0].label = 'Stock Level';
        
        // Calculate summary data
        summary.total = sortedProducts.reduce((sum, p) => sum + (p.inStock || 0), 0);
        sortedProducts.forEach(p => {
          const stockLevel = p.inStock || 0;
          summary.min = Math.min(summary.min, stockLevel);
          summary.max = Math.max(summary.max, stockLevel);
        });
        break;

      case 'returns':
        // Group returns by reason
        const returnsByReason = {};
        data.forEach(item => {
          const reason = item.notes || 'No reason provided';
          if (!returnsByReason[reason]) {
            returnsByReason[reason] = 0;
          }
          
          const returnCount = item.products.reduce((sum, p) => sum + p.quantity, 0);
          returnsByReason[reason] += returnCount;
          
          summary.total += returnCount;
          summary.min = Math.min(summary.min, returnCount);
          summary.max = Math.max(summary.max, returnCount);
        });
        
        processedData.labels = Object.keys(returnsByReason);
        processedData.datasets[0].data = Object.values(returnsByReason);
        processedData.datasets[0].label = 'Number of Returns';
        chartType = 'doughnut';
        break;

      default:
        break;
    }

    // Calculate average
    summary.average = summary.total / summary.count;
    if (summary.min === Infinity) summary.min = 0;
    
    setSummaryData(summary);

    // Create chart configuration
    const config = {
      type: chartType,
      data: processedData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report Visualization`
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== undefined) {
                  label += context.parsed.y;
                } else if (context.parsed !== undefined) {
                  label += context.parsed;
                }
                return label;
              }
            }
          }
        }
      }
    };

    // Create the chart
    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, config);

    // Clean up function
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [reportType, data]);

  return (
    <div className="mb-6">
      <div className="flex flex-wrap justify-around mb-4 bg-gray-50 rounded-md p-4">
        <div className="text-center p-2">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-xl font-semibold">
            {reportType === 'sales' ? '₱' : ''}{summaryData.total.toFixed(reportType === 'sales' ? 2 : 0)}
          </p>
        </div>
        <div className="text-center p-2">
          <p className="text-sm text-gray-500">Average</p>
          <p className="text-xl font-semibold">
            {reportType === 'sales' ? '₱' : ''}{summaryData.average.toFixed(reportType === 'sales' ? 2 : 0)}
          </p>
        </div>
        <div className="text-center p-2">
          <p className="text-sm text-gray-500">Count</p>
          <p className="text-xl font-semibold">{summaryData.count}</p>
        </div>
        <div className="text-center p-2">
          <p className="text-sm text-gray-500">Minimum</p>
          <p className="text-xl font-semibold">
            {reportType === 'sales' ? '₱' : ''}{summaryData.min.toFixed(reportType === 'sales' ? 2 : 0)}
          </p>
        </div>
        <div className="text-center p-2">
          <p className="text-sm text-gray-500">Maximum</p>
          <p className="text-xl font-semibold">
            {reportType === 'sales' ? '₱' : ''}{summaryData.max.toFixed(reportType === 'sales' ? 2 : 0)}
          </p>
        </div>
      </div>
      
      <div style={{ height: '400px' }}>
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
};

export default ReportVisualization;