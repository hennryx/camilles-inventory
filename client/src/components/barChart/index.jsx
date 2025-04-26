import React, { useEffect } from "react";
import Chart from "chart.js/auto";

const BarChart = () => {
  useEffect(() => {
    const data = [
      { year: 2010, count: 10 },
      { year: 2011, count: 20 },
      { year: 2012, count: 15 },
      { year: 2013, count: 25 },
      { year: 2014, count: 22 },
      { year: 2015, count: 30 },
      { year: 2016, count: 28 },
    ];

    new Chart(document.getElementById("salesContainer"), {
      type: "bar",
      data: {
        labels: data.map((row) => row.year),
        datasets: [
          {
            label: "Sales", 
            data: data.map((row) => row.count), // Data for the bars
            backgroundColor: "rgba(75, 192, 192, 0.2)", // Bar color
            borderColor: "rgba(75, 192, 192, 1)", // Border color
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Sales",
          },
        },
      },
    });

    // Cleanup chart on unmount
    return () => {
      const chartElement = document.getElementById("salesContainer");
      if (chartElement && chartElement.chart) {
        chartElement.chart.destroy();
      }
    };
  }, []);

  return (
    <div>
      <h2>Chart.js Example with React</h2>
      <canvas id="salesContainer"></canvas>
    </div>
  );
};

export default BarChart;
