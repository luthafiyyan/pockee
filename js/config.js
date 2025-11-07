
// ========================================
// FIREBASE CONFIGURATION
// ========================================
const firebaseConfig = {
    apiKey: "AIzaSyCi1NVol8qewmYFJxG67vys5BfCrBt-6ms",
    authDomain: "catatan-keuangan-by-haf.firebaseapp.com",
    projectId: "catatan-keuangan-by-haf",
    storageBucket: "catatan-keuangan-by-haf.firebasestorage.app",
    messagingSenderId: "412925412888",
    appId: "1:412925412888:web:4e2ba5ab894a3582d8e56d",
    measurementId: "G-M4GB8KJZD4"
};

// ========================================
// FIREBASE INITIALIZATION
// ========================================
let auth, db;
let isFirebaseEnabled = false;

function initializeFirebase() {
    try {
        console.log('🔧 Initializing Firebase...');
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        
        db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
            if (err.code == 'failed-precondition') {
                console.log('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.');
            } else if (err.code == 'unimplemented') {
                console.log('⚠️ The current browser does not support persistence.');
            }
        });
        
        console.log('✅ Firebase berhasil diinisialisasi');
        isFirebaseEnabled = true;
    } catch (error) {
        console.error('❌ Firebase gagal diinisialisasi:', error);
        showNotification('Error Firebase: ' + error.message, 'error');
        isFirebaseEnabled = false;
    }
}
