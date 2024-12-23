document.addEventListener('DOMContentLoaded', () => {
    const revenueTimeRangeSelect = document.getElementById('revenueTimeRange');
    const topRevenueTimeRangeSelect = document.getElementById('topRevenueTimeRange');

    const revenueChartCtx = document.getElementById('revenueChart').getContext('2d');
    const topRevenueChartCtx = document.getElementById('topRevenueChart').getContext('2d');

    let revenueChart;
    let topRevenueChart;

    async function fetchRevenueReport(timeRange) {
        const response = await fetch(`/api/revenue-report?timeRange=${timeRange}`);
        const data = await response.json();
        return data;
    }

    async function fetchTopRevenueProducts(timeRange) {
        const response = await fetch(`/api/top-revenue-products?timeRange=${timeRange}`);
        const data = await response.json();
        return data;
    }

    async function updateRevenueChart(timeRange) {
        const data = await fetchRevenueReport(timeRange);
        const labels = data.map(item => item.date);
        const values = data.map(item => item.totalRevenue);

        if (revenueChart) {
            revenueChart.destroy();
        }

        revenueChart = new Chart(revenueChartCtx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Revenue',
                    data: values,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: timeRange
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    async function updateTopRevenueChart(timeRange) {
        const data = await fetchTopRevenueProducts(timeRange);
        const labels = data.map(item => item.productName);
        const values = data.map(item => item.totalRevenue);

        if (topRevenueChart) {
            topRevenueChart.destroy();
        }

        topRevenueChart = new Chart(topRevenueChartCtx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Revenue',
                    data: values,
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
    }

    revenueTimeRangeSelect.addEventListener('change', (event) => {
        updateRevenueChart(event.target.value);
    });

    topRevenueTimeRangeSelect.addEventListener('change', (event) => {
        updateTopRevenueChart(event.target.value);
    });

    // Initial load
    updateRevenueChart('day');
    updateTopRevenueChart('day');
});