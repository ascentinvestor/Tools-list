/* Shared utility functions — used across calculator pages */

function formatCurrency(num) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(num);
}

function formatDate(date) {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* Raw format: Unicode rupee symbol + en-IN number (used by fire-calc) */
function rawFmt(num) {
    return '\u20B9\u00A0' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(num);
}
