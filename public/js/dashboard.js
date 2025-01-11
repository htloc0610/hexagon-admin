document.addEventListener('DOMContentLoaded', () => {
    // Preprocess data for Revenue Report Chart
    const revenueLabels = [];
    const revenueValues = [];
    const timeRange = document.getElementById('revenueTimeRange').value;

    revenueReport.forEach((item) => {
        let label;
        if (timeRange === 'week') {
            label = new Date(item.date).toLocaleDateString();
        } else if (timeRange === 'month') {
            label = new Date(item.date).toLocaleDateString();
        } else {
            label = new Date(item.date).toLocaleDateString();
        }
        revenueLabels.push(label);
        revenueValues.push(item.totalRevenue);
    });

    const revenueChartCtx = document.getElementById('revenueChart').getContext('2d');
    new Chart(revenueChartCtx, {
        type: 'line',
        data: {
            labels: revenueLabels,
            datasets: [{
                label: 'Revenue',
                data: revenueValues,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Preprocess data for Top Revenue Products Chart
    const topRevenueLabels = topRevenueProducts.map(item => item.productName);
    const topRevenueValues = topRevenueProducts.map(item => item.totalRevenue);

    const topRevenueChartCtx = document.getElementById('topRevenueChart').getContext('2d');
    new Chart(topRevenueChartCtx, {
        type: 'bar',
        data: {
            labels: topRevenueLabels,
            datasets: [{
                label: 'Revenue',
                data: topRevenueValues,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});