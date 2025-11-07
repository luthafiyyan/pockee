
// ========================================
// CHART GLOBALS
// ========================================
let charts = {};
let currentAnalyticsPeriod = 'week';

// ========================================
// CHART FUNCTIONS
// ========================================
function updateCharts() {
    updateExpenseChart();
    updateTrendChart();
}

function updateExpenseChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    if (charts.expense) charts.expense.destroy();

    const expensesByCategory = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });

    const labels = Object.keys(expensesByCategory);
    const data = Object.values(expensesByCategory);
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'];

    charts.expense = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0
            }]
        },
        options: getChartOptions('doughnut')
    });
}

function updateTrendChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    if (charts.trend) charts.trend.destroy();

    const monthlyData = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short' });
        monthlyData[monthKey] = { income: 0, expense: 0 };
    }

    transactions.forEach(t => {
        const transactionDate = new Date(t.date);
        const monthKey = transactionDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'short' });
        if (monthlyData[monthKey]) {
            monthlyData[monthKey][t.type] += t.amount;
        }
    });

    const labels = Object.keys(monthlyData);
    const incomeData = labels.map(label => monthlyData[label].income);
    const expenseData = labels.map(label => monthlyData[label].expense);

    charts.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pemasukan',
                data: incomeData,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4
            }, {
                label: 'Pengeluaran',
                data: expenseData,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4
            }]
        },
        options: getChartOptions('line')
    });
}

function updateAnalyticsCharts() {
    updateAnalyticsStats();
    updateDailyExpenseChart();
    updateCategoryPercentageChart();
    updateCategoryBreakdown();
}

function updateDailyExpenseChart() {
    const ctx = document.getElementById('dailyExpenseChart').getContext('2d');
    if (charts.dailyExpense) charts.dailyExpense.destroy();

    const filteredTransactions = getFilteredTransactionsByPeriod();
    const dailyData = {};
    const now = new Date();
    let chartTitle = 'Pengeluaran Harian';
    let dateRange = 7;

    if (currentAnalyticsPeriod === 'week') {
        chartTitle = 'Pengeluaran Harian (7 Hari)';
        dateRange = 7;
    } else if (currentAnalyticsPeriod === 'month') {
        chartTitle = 'Pengeluaran Harian (30 Hari)';
        dateRange = 30;
    } else if (currentAnalyticsPeriod === 'year') {
        chartTitle = 'Pengeluaran Bulanan (12 Bulan)';
        dateRange = 12;
    } else {
        chartTitle = 'Pengeluaran (Semua Waktu)';
        dateRange = 30;
    }

    document.getElementById('dailyChartTitle').textContent = chartTitle;

    if (currentAnalyticsPeriod === 'year') {
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
            dailyData[monthKey] = 0;
            filteredTransactions.filter(t => {
                const tDate = new Date(t.date);
                return t.type === 'expense' && tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
            }).forEach(t => { dailyData[monthKey] += t.amount; });
        }
    } else {
        for (let i = dateRange - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dayKey = date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: currentAnalyticsPeriod === 'month' ? 'short' : undefined });
            const dateKey = date.toISOString().split('T')[0];
            dailyData[dayKey] = 0;
            filteredTransactions.filter(t => t.type === 'expense' && t.date === dateKey).forEach(t => { dailyData[dayKey] += t.amount; });
        }
    }

    const labels = Object.keys(dailyData);
    const data = Object.values(dailyData);

    charts.dailyExpense = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: chartTitle,
                data: data,
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 1
            }]
        },
        options: getChartOptions('bar')
    });
}

function updateCategoryPercentageChart() {
    const ctx = document.getElementById('categoryPercentageChart').getContext('2d');
    if (charts.categoryPercentage) charts.categoryPercentage.destroy();

    const filteredTransactions = getFilteredTransactionsByPeriod();
    const expensesByCategory = {};
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });

    const categoryEmojis = getCategoryEmojis();
    const total = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);
    const labels = Object.keys(expensesByCategory).map(cat => `${categoryEmojis[cat] || '📝'} ${cat}`);
    const data = Object.values(expensesByCategory);
    const percentages = data.map(val => ((val / total) * 100).toFixed(1));
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

    if (labels.length === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = '16px Inter';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText('Belum ada data pengeluaran', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }

    charts.categoryPercentage = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 3,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                hoverBorderWidth: 5,
                hoverBorderColor: 'rgba(255, 255, 255, 0.4)'
            }]
        },
        options: getChartOptions('doughnut-percentage', percentages)
    });
}

function getChartOptions(type, customData) {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const fontColor = isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: fontColor, font: { weight: '500' } }
            }
        }
    };

    if (type === 'line' || type === 'bar') {
        options.scales = {
            y: {
                beginAtZero: true,
                ticks: { color: fontColor, font: { weight: '500' }, callback: value => formatCurrency(value) },
                grid: { color: gridColor }
            },
            x: {
                ticks: { color: fontColor, font: { weight: '500' } },
                grid: { color: gridColor }
            }
        };
    }

    if (type === 'doughnut-percentage') {
        options.plugins.legend.position = 'right';
        options.plugins.legend.labels.usePointStyle = true;
        options.plugins.legend.labels.padding = 15;
        options.plugins.tooltip = {
            callbacks: {
                label: function(context) {
                    const percentage = customData[context.dataIndex];
                    const amount = formatCurrency(context.parsed);
                    return `${context.label}: ${amount} (${percentage}%)`;
                }
            }
        };
    }
    
    if (type === 'bar') {
        options.plugins.legend.display = false;
    }

    return options;
}

// ========================================
// ANALYTICS DISPLAY FUNCTIONS
// ========================================

function setAnalyticsPeriod(period) {
    currentAnalyticsPeriod = period;
    document.querySelectorAll('.analytics-period-btn').forEach(btn => {
        btn.classList.remove('glass-button');
        btn.classList.add('glass-light', 'text-glass-light');
    });
    const activeBtn = document.getElementById(period + 'Btn');
    if (activeBtn) {
        activeBtn.classList.remove('glass-light', 'text-glass-light');
        activeBtn.classList.add('glass-button');
    }
    const periodTexts = { 'week': 'Minggu ini', 'month': 'Bulan ini', 'year': 'Tahun ini', 'all': 'Semua waktu' };
    document.getElementById('currentPeriodText').textContent = periodTexts[period];
    updateAnalyticsCharts();
}

function getFilteredTransactionsByPeriod() {
    const now = new Date();
    let startDate;
    switch (currentAnalyticsPeriod) {
        case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - now.getDay());
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            return transactions;
    }
    return transactions.filter(t => new Date(t.date) >= startDate && new Date(t.date) <= now);
}

function updateAnalyticsStats() {
    const filteredTransactions = getFilteredTransactionsByPeriod();
    document.getElementById('totalTransactionsCount').textContent = filteredTransactions.length;

    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

    let avgDaily = 0;
    if (currentAnalyticsPeriod === 'week') {
        avgDaily = totalExpenses / 7;
    } else if (currentAnalyticsPeriod === 'month') {
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        avgDaily = totalExpenses / daysInMonth;
    } else if (currentAnalyticsPeriod === 'year') {
        const daysInYear = new Date().getFullYear() % 4 === 0 ? 366 : 365;
        avgDaily = totalExpenses / daysInYear;
    } else {
        const dates = filteredTransactions.map(t => new Date(t.date));
        if (dates.length > 0) {
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            const daysDiff = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;
            avgDaily = totalExpenses / daysDiff;
        } else {
            avgDaily = 0;
        }
    }
    document.getElementById('avgDailyExpense').textContent = formatCurrency(avgDaily);

    const expensesByCategory = {};
    expenses.forEach(t => { expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount; });
    const topCategory = Object.keys(expensesByCategory).reduce((a, b) => expensesByCategory[a] > expensesByCategory[b] ? a : b, '-');
    document.getElementById('topCategory').textContent = topCategory;

    const maxExpense = expenses.reduce((max, t) => t.amount > max ? t.amount : max, 0);
    document.getElementById('maxExpense').textContent = formatCurrency(maxExpense);
}

function updateCategoryBreakdown() {
    const container = document.getElementById('categoryBreakdown');
    const filteredTransactions = getFilteredTransactionsByPeriod();
    const expensesByCategory = {};
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });

    const totalExpense = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);
    if (totalExpense === 0) {
        container.innerHTML = '<p class="text-center text-glass-light">Tidak ada data pengeluaran untuk periode ini.</p>';
        return;
    }

    const categoryEmojis = getCategoryEmojis();
    container.innerHTML = Object.entries(expensesByCategory).sort(([,a],[,b]) => b-a).map(([category, amount]) => {
        const percentage = ((amount / totalExpense) * 100).toFixed(1);
        return `
            <div class="glass-light rounded-lg p-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <span class="mr-3">${categoryEmojis[category] || '📝'}</span>
                        <span class="font-medium text-glass">${category}</span>
                    </div>
                    <div class="text-right">
                        <p class="font-semibold text-glass">${formatCurrency(amount)}</p>
                        <p class="text-xs text-glass-light">${percentage}%</p>
                    </div>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                    <div class="bg-blue-400 h-1.5 rounded-full" style="width: ${percentage}%"></div>
                </div>
            </div>`;
    }).join('');
}

function updateSummary() {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalBalance = totalIncome - totalExpense;

    document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('totalExpense').textContent = formatCurrency(totalExpense);
    document.getElementById('totalBalance').textContent = formatCurrency(totalBalance);

    const balanceElement = document.getElementById('totalBalance');
    balanceElement.className = totalBalance >= 0 ? 'text-xl sm:text-2xl lg:text-3xl font-bold income mt-1 sm:mt-2' : 'text-xl sm:text-2xl lg:text-3xl font-bold expense mt-1 sm:mt-2';
}
