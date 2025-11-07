
// ========================================
// ENCRYPTION FUNCTIONS
// ========================================

// Generate encryption key based on user ID
function generateEncryptionKey(userId) {
    const baseKey = 'PockeeSecure2024_' + userId;
    return CryptoJS.SHA256(baseKey).toString();
}

// Encrypt transaction data
function encryptTransactionData(transactionData, userId) {
    try {
        const key = generateEncryptionKey(userId);
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(transactionData), key).toString();
        console.log('🔐 Data transaksi berhasil dienkripsi');
        return encrypted;
    } catch (error) {
        console.error('❌ Error enkripsi data:', error);
        throw new Error('Gagal mengenkripsi data transaksi');
    }
}

// Decrypt transaction data
function decryptTransactionData(encryptedData, userId) {
    try {
        const key = generateEncryptionKey(userId);
        const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
        
        if (!decryptedString) {
            throw new Error('Gagal mendekripsi data - kunci tidak valid');
        }
        
        const parsedData = JSON.parse(decryptedString);
        console.log('🔓 Data transaksi berhasil didekripsi');
        return parsedData;
    } catch (error) {
        console.error('❌ Error dekripsi data:', error);
        throw new Error('Gagal mendekripsi data transaksi');
    }
}

// Encrypt individual transaction
function encryptTransaction(transaction, userId) {
    // If it's already encrypted, just return it.
    if (transaction.encryptedData) {
        return transaction;
    }

    const sensitiveData = {
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category
    };
    
    return {
        id: transaction.id,
        type: transaction.type,
        date: transaction.date,
        createdAt: transaction.createdAt,
        encryptedData: encryptTransactionData(sensitiveData, userId)
    };
}

// Decrypt individual transaction
function decryptTransaction(transaction, userId) {
    // If the transaction does not have encryptedData, it's likely a plain text object
    if (!transaction.encryptedData) {
        console.warn('⚠️ Transaksi tidak terenkripsi, mengembalikan apa adanya:', transaction);
        return transaction;
    }

    try {
        const decryptedData = decryptTransactionData(transaction.encryptedData, userId);
        
        return {
            id: transaction.id,
            type: transaction.type,
            date: transaction.date,
            createdAt: transaction.createdAt,
            amount: decryptedData.amount,
            description: decryptedData.description,
            category: decryptedData.category
        };
    } catch (error) {
        console.error('❌ Error mendekripsi transaksi:', error);
        // Return a placeholder for corrupted data
        return {
            id: transaction.id,
            type: 'expense',
            date: transaction.date || new Date().toISOString().split('T')[0],
            createdAt: transaction.createdAt || new Date().toISOString(),
            amount: 0,
            description: '[Data Terenkripsi - Tidak Dapat Dibaca]',
            category: 'lainnya'
        };
    }
}


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
