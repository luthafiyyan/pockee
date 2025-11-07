
// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================

let currentUser = null;

async function loginWithGoogle() {
    console.log('🔐 Mencoba login dengan Google...');
    
    if (!isFirebaseEnabled) {
        showNotification('Firebase belum dikonfigurasi!', 'error');
        return;
    }
    
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        
        const result = await auth.signInWithPopup(provider);
        console.log('✅ Login berhasil:', result.user.email);
        showNotification('Login berhasil! Selamat datang ' + result.user.displayName, 'success');
        
    } catch (error) {
        console.error('❌ Error login:', error);
        let errorMessage = 'Gagal login: ';
        switch (error.code) {
            case 'auth/popup-blocked':
                errorMessage += 'Popup diblokir browser. Mohon izinkan popup.';
                break;
            case 'auth/cancelled-popup-request':
                errorMessage += 'Login dibatalkan.';
                break;
            case 'auth/unauthorized-domain':
                errorMessage += 'Domain tidak diizinkan. Periksa Firebase Console.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage += 'Google Sign-in belum diaktifkan di Firebase.';
                break;
            default:
                errorMessage += error.message;
        }
        showNotification(errorMessage, 'error');
    }
}

async function logout() {
    try {
        await auth.signOut();
        console.log('✅ Logout berhasil');
        showNotification('Logout berhasil!', 'success');
    } catch (error) {
        console.error('❌ Error logout:', error);
        showNotification('Gagal logout: ' + error.message, 'error');
    }
}

function handleAuthStateChange() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            console.log('✅ User login:', user.email);
            showMainApp();
            loadUserTransactions();
        } else {
            currentUser = null;
            console.log('❌ Tidak ada user yang login');
            showLoginScreen();
        }
    });
}
