
// ========================================
// UI FUNCTIONS
// ========================================

function showLoadingScreen() {
    document.getElementById('loadingScreen').classList.remove('hidden');
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showLoginScreen() {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    
    // Update user info
    document.getElementById('userName').textContent = currentUser.displayName || 'Pengguna';
    
    // Update user photo if available
    const userPhoto = document.getElementById('userPhoto');
    if (currentUser.photoURL) {
        userPhoto.src = currentUser.photoURL;
        userPhoto.style.display = 'block';
    } else {
        userPhoto.style.display = 'none';
    }
    
    // Load user transactions first, then initialize dashboard
    loadUserTransactions().then(() => {
        console.log('🎯 Initializing dashboard after loading transactions');
        updateSummary();
        updateCharts();
        displayTransactions();
        showSection('dashboard');
    });
}

function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileMenuOverlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('hidden');
}

function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileMenuOverlay');
    sidebar.classList.remove('active');
    overlay.classList.add('hidden');
}

function showSection(section) {
    // Hide all sections
    document.querySelectorAll('[id$="Section"]').forEach(el => el.classList.add('hidden'));
    
    // Show selected section
    document.getElementById(section + 'Section').classList.remove('hidden');
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'transactions': 'Transaksi',
        'analytics': 'Analisis'
    };
    document.getElementById('pageTitle').textContent = titles[section];
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('bg-white', 'bg-opacity-20'));
    // Check if event is available, if not, find the element by section
    const navItem = document.querySelector(`.nav-item[onclick="showSection('${section}')"]`);
    if (navItem) {
        navItem.classList.add('bg-white', 'bg-opacity-20');
    }
    
    currentSection = section;
    
    // Update charts if analytics section
    if (section === 'analytics') {
        setTimeout(updateAnalyticsCharts, 100);
    }
    
    closeMobileMenu();
}

// ========================================
// MODAL FUNCTIONS
// ========================================
function showAddTransactionModal() {
    document.getElementById('addTransactionModal').classList.remove('hidden');
    document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];
}

function closeAddTransactionModal() {
    document.getElementById('addTransactionModal').classList.add('hidden');
    document.getElementById('transactionForm').reset();
}

// Dark Mode
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
        darkModeToggle.checked = true;
    } else {
        document.documentElement.classList.remove('dark');
        darkModeToggle.checked = false;
    }
}

function toggleDarkMode() {
    if (document.getElementById('darkModeToggle').checked) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
    }
    // We might need to re-render charts on dark mode toggle
    updateCharts(); 
    updateAnalyticsCharts();
}
