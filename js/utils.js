



// ========================================
// UTILITY FUNCTIONS
// ========================================
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function showNotification(message, type = 'info') {
    // This is a placeholder for a more advanced notification system
    alert(message);
}
