document.addEventListener('DOMContentLoaded', function () {
    const chartCanvas = document.getElementById('bookingActivityChart');

    if (!chartCanvas) {
        return;
    }

    const ctx = chartCanvas.getContext('2d');

    let labels = [];
    let data = [];

    try {
        labels = JSON.parse(chartCanvas.dataset.labels || '[]');
        data = JSON.parse(chartCanvas.dataset.data || '[]');
    } catch (e) {
        console.error('Error parsing chart data:', e);
    }

    function getChartColors() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
            document.body.classList.contains('ea-dark-scheme');

        return {
            textColor: isDark ? '#ffffff' : '#666666',
            gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        };
    }

    let bookingActivityChart = createChart(ctx, labels, data);

    function createChart(context, labels, data) {
        const colors = getChartColors();

        return new Chart(context, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Reservas por día',
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: colors.textColor },
                        grid: { color: colors.gridColor }
                    },
                    x: {
                        ticks: { color: colors.textColor },
                        grid: { color: colors.gridColor }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: colors.textColor
                        }
                    }
                }
            }
        });
    }

    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === "attributes" && (mutation.attributeName === "data-theme" || mutation.attributeName === "class")) {
                if (bookingActivityChart) {
                    bookingActivityChart.destroy();
                    bookingActivityChart = createChart(ctx, labels, data);
                }
            }
        });
    });

    observer.observe(document.documentElement, { attributes: true });
    observer.observe(document.body, { attributes: true });
});
