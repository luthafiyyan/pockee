// ========================================
// APP INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Pockee dimulai...');
    
    showLoadingScreen();
    
    setTimeout(() => {
        initializeFirebase();
        
        if (isFirebaseEnabled) {
            handleAuthStateChange();
        }
        
        setupEventListeners();
        initializeDarkMode();
    }, 2000); // 2 second loading screen
});

function setupEventListeners() {
    // Mobile menu
    document.getElementById('mobileMenuBtn').addEventListener('click', toggleMobileMenu);
    document.getElementById('mobileMenuOverlay').addEventListener('click', closeMobileMenu);
    
    // Filters
    document.getElementById('filterType').addEventListener('change', filterTransactions);
    document.getElementById('filterCategory').addEventListener('change', filterTransactions);
    document.getElementById('searchInput').addEventListener('keyup', filterTransactions);
    
    // Transaction form
    document.getElementById('transactionForm').addEventListener('submit', handleAddTransaction);

    // Nav items - using event delegation
    document.getElementById('sidebar').addEventListener('click', function(event) {
        const navItem = event.target.closest('.nav-item');
        if (navItem) {
            const section = navItem.getAttribute('onclick').match(/\'([^\']+)\'/)[1];
            showSection(section);
        }
    });
}

function filterTransactions() {
    loadAllTransactions();
}