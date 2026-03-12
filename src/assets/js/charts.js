/* Custom canvas chart utilities — used by fd-calc and other calculator pages */

function drawPieChart(canvas, data, options = {}) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];
    let total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    data.forEach((item, index) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        currentAngle += sliceAngle;
    });

    if (options.title) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(options.title, width / 2, 5);
    }
}

function drawLineChart(canvas, data, options = {}) {
    if (!data || data.length === 0) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    const padding = { top: 30, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const adjustedMin = minValue * 0.95;
    const adjustedMax = maxValue * 1.05;

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 5; i++) {
        const y = padding.top + chartHeight - (i / 5) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();

        const value = adjustedMin + (adjustedMax - adjustedMin) * (i / 5);
        ctx.fillStyle = '#666';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText('₹' + Math.round(value / 1000) + 'K', padding.left - 5, y);
    }

    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    ctx.beginPath();

    const denominator = data.length > 1 ? data.length - 1 : 1;
    data.forEach((point, index) => {
        const x = padding.left + (chartWidth * index / denominator);
        const y = padding.top + chartHeight - ((point.value - adjustedMin) / (adjustedMax - adjustedMin)) * chartHeight;
        index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });

    ctx.stroke();

    ctx.fillStyle = '#4f46e5';
    data.forEach((point, index) => {
        const x = padding.left + (chartWidth * index / denominator);
        const y = padding.top + chartHeight - ((point.value - adjustedMin) / (adjustedMax - adjustedMin)) * chartHeight;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
}
