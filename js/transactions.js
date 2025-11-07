
// ========================================
// TRANSACTION GLOBALS
// ========================================
let transactions = [];

// ========================================
// TRANSACTION FUNCTIONS
// ========================================
async function handleAddTransaction(e) {
    e.preventDefault();
    
    console.log('🔄 Starting add transaction process...');
    
    if (!currentUser) {
        console.log('❌ No current user');
        showNotification('Silakan login terlebih dahulu!', 'error');
        return;
    }
    
    const type = document.getElementById('transactionType').value;
    const amount = parseFloat(document.getElementById('transactionAmount').value);
    const category = document.getElementById('transactionCategory').value;
    const description = document.getElementById('transactionDescription').value;
    const date = document.getElementById('transactionDate').value;
    
    if (!amount || amount <= 0 || !description || !date) {
        showNotification('Mohon lengkapi semua field dengan benar!', 'error');
        return;
    }
    
    const transaction = {
        id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
        type: type,
        amount: Number(amount),
        category: category,
        description: description.trim(),
        date: date,
        createdAt: new Date().toISOString()
    };
    
    try {
        transactions.unshift(transaction);
        displayTransactions();
        updateSummary();
        updateCharts();
        closeAddTransactionModal();
        
        await saveUserTransactions();
        showNotification('Transaksi berhasil ditambahkan!', 'success');
        
    } catch (error) {
        transactions = transactions.filter(t => t.id !== transaction.id);
        displayTransactions();
        updateSummary();
        updateCharts();
        showNotification('Gagal menambah transaksi: ' + error.message, 'error');
    }
}

async function deleteTransaction(id) {
    if (!currentUser) {
        showNotification('Silakan login terlebih dahulu!', 'error');
        return;
    }
    
    if (confirm('Yakin ingin menghapus transaksi ini?')) {
        try {
            transactions = transactions.filter(t => t.id !== id);
            await saveUserTransactions();
            displayTransactions();
            updateSummary();
            updateCharts();
            showNotification('Transaksi berhasil dihapus!', 'success');
        } catch (error) {
            showNotification('Gagal menghapus transaksi: ' + error.message, 'error');
        }
    }
}

async function clearAllTransactions() {
    if (!currentUser) return;
    
    if (confirm('Yakin ingin menghapus SEMUA transaksi? Tindakan ini tidak dapat dibatalkan.')) {
        transactions = [];
        await saveUserTransactions();
        displayTransactions();
        updateSummary();
        updateCharts();
        showNotification('Semua transaksi berhasil dihapus!', 'success');
    }
}

// ========================================
// FIREBASE DATABASE FUNCTIONS (WITH ENCRYPTION)
// ========================================
async function saveUserTransactions() {
    if (!currentUser || !isFirebaseEnabled) return;
    
    try {
        const userDocRef = db.collection('users').doc(currentUser.uid);
        await userDocRef.set({
            email: currentUser.email,
            displayName: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
            transactions: transactions, // Save plain transactions
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
            totalTransactions: transactions.length
        }, { merge: true });
        console.log('✅ Data berhasil disimpan ke Firebase');
    } catch (error) {
        console.error('❌ Error menyimpan ke Firebase:', error);
        throw error;
    }
}

async function loadUserTransactions() {
    if (!currentUser || !isFirebaseEnabled) return;
    
    try {
        const userDocRef = db.collection('users').doc(currentUser.uid);
        const userDoc = await userDocRef.get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            transactions = userData.transactions || [];
            console.log('✅ Berhasil memuat', transactions.length, 'transaksi');
        } else {
            transactions = [];
            await userDocRef.set({
                email: currentUser.email,
                displayName: currentUser.displayName || '',
                transactions: [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                totalTransactions: 0
            });
            showNotification('Selamat datang! Akun baru telah dibuat.', 'success');
        }
    } catch (error) {
        console.error('❌ Error memuat dari Firebase:', error);
        showNotification('Gagal memuat data: ' + error.message, 'error');
        transactions = [];
    }
}

// ========================================
// DISPLAY FUNCTIONS
// ========================================
function displayTransactions() {
    loadRecentTransactions();
    loadAllTransactions();
}

function loadRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    if (!container) return;

    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recent = sortedTransactions.slice(0, 5);

    if (recent.length === 0) {
        container.innerHTML = `<div class="text-center text-glass-light py-8">
            <i class="fas fa-receipt text-4xl mb-4 opacity-50"></i>
            <p>Belum ada transaksi</p>
            <p class="text-sm mt-2">Klik "Tambah Transaksi" untuk memulai</p>
        </div>`;
        return;
    }

    const categoryEmojis = getCategoryEmojis();
    container.innerHTML = recent.map(transaction => createTransactionHTML(transaction, categoryEmojis)).join('');
}

function loadAllTransactions() {
    const container = document.getElementById('transactionsList');
    if (!container) {
        console.error("Element with ID 'transactionsList' not found.");
        return;
    }

    console.log("--- Running loadAllTransactions (DEBUG MODE - NO FILTERING) ---");
    console.log("Transactions array to be rendered:", JSON.parse(JSON.stringify(transactions)));

    let filteredTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filteredTransactions.length === 0) {
        container.innerHTML = `<div class="text-center text-glass-light py-8">
            <i class="fas fa-receipt text-4xl mb-4 opacity-50"></i>
            <p>Belum ada transaksi</p>
            <p class="text-sm mt-2">Klik "Tambah Transaksi" untuk memulai</p>
        </div>`;
        console.log("Rendered 'No transactions' message because array is empty.");
        return;
    }

    const categoryEmojis = getCategoryEmojis();
    container.innerHTML = filteredTransactions.map(transaction => createTransactionHTML(transaction, categoryEmojis, true)).join('');
    console.log(`Rendered ${filteredTransactions.length} transaction(s).`);
}

function createTransactionHTML(transaction, emojis, showDelete = false) {
    const isIncome = transaction.type === 'income';
    const sign = isIncome ? '+' : '-';
    const amountClass = isIncome ? 'income' : 'expense';
    const gradientClass = isIncome ? 'gradient-income' : 'gradient-expense';
    const arrowClass = isIncome ? 'fa-arrow-up' : 'fa-arrow-down';

    const deleteButton = showDelete ? 
        `<button onclick="deleteTransaction('${transaction.id}')" class="text-red-300 hover:text-red-200 p-1 sm:p-2 rounded-lg hover:bg-red-500 hover:bg-opacity-20 transition-all" title="Hapus transaksi">
            <i class="fas fa-trash text-xs sm:text-sm"></i>
        </button>` : '';

    return `
        <div class="flex items-center justify-between p-3 sm:p-4 glass-light rounded-lg sm:rounded-xl hover:glass-card transition-all duration-300 hover-lift mb-2 sm:mb-3">
            <div class="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${gradientClass}">
                    <i class="fas ${arrowClass} text-white text-sm sm:text-base"></i>
                </div>
                <div class="min-w-0 flex-1">
                    <p class="font-medium text-glass text-sm sm:text-base truncate">${transaction.description}</p>
                    <p class="text-xs sm:text-sm text-glass-light">${emojis[transaction.category] || '📝'} ${transaction.category} • ${new Date(transaction.date).toLocaleDateString('id-ID')}</p>
                </div>
            </div>
            <div class="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                <span class="font-semibold text-sm sm:text-base ${amountClass}">
                    ${sign}${formatCurrency(transaction.amount)}
                </span>
                ${deleteButton}
            </div>
        </div>`;
}

function getCategoryEmojis() {
    return {
        'makanan': '🍽️',
        'transportasi': '🚗',
        'belanja': '🛍️',
        'hiburan': '🎬',
        'kesehatan': '🏥',
        'gaji': '💼',
        'bonus': '🎁',
        'lainnya': '📝'
    };
}


